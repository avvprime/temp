class Remover{

	baseName = '';
	nameIdCounter = 0;

    constructor()
    {
		this.fileInput = document.getElementById('img-input');
		this.nameInput = document.getElementById('base-name');
		this.bgColorInput = document.getElementById('img-bg');
		this.resultContainer = document.getElementById('results');
		this.isConvertToTransparent = document.getElementById('convert-to-transparent');

        this.canvasOne = document.createElement('canvas');
        this.ctxOne = this.canvasOne.getContext('2d', { willReadFrequently: true });

        this.canvasTwo = document.createElement('canvas');
        this.ctxTwo = this.canvasTwo.getContext('2d');

		this.processFunc = this.clearTransparentSpace;

		this.fileInput.addEventListener('input', this.processFiles.bind(this));
		this.nameInput.addEventListener('input', this.changeName.bind(this));
		this.bgColorInput.addEventListener('change', this.changeBGColor.bind(this));
		
    }

	changeName(e)
	{
		this.baseName = this.nameInput.value;
	}

	changeBGColor(e)
	{
		const val = this.bgColorInput.value;
		if (val === "0") this.processFunc = this.clearTransparentSpace;
		else if (val === "1") this.processFunc = this.clearWhiteSpace;
	}

    processFiles(e)
    {
        for(let i = 0; i < this.fileInput.files.length; i++){
			const reader = new FileReader();
			reader.onload = e => {
				const blob = e.target.result;
				const img = new Image();
				img.onload = () => { this.processFile(img) };
				img.src = blob;
			}
            reader.readAsDataURL(this.fileInput.files[i]);
        }
    }
    
    processFile(img)
    {
        this.canvasOne.width = img.width;
		this.canvasOne.height = img.height;

		this.ctxOne.clearRect(0, 0, this.canvasOne.width, this.canvasOne.height);
		this.ctxOne.drawImage(img, 0, 0);

		const filledImgCoord = this.processFunc();

		const w = filledImgCoord[2] - filledImgCoord[0];
		const h = filledImgCoord[3] - filledImgCoord[1];
	
		this.canvasTwo.width = w;
		this.canvasTwo.height = h;
		this.ctxTwo.drawImage(this.canvasOne, filledImgCoord[0], filledImgCoord[1], w, h, 0, 0, w, h);
	
		if(this.isConvertToTransparent.checked) this.convertWhiteSpaceToTransparent();

		const dataURL = this.canvasTwo.toDataURL('image/png');
		
        const name = this.baseName + this.nameIdCounter;
		this.nameIdCounter++;

		let link = document.createElement('a');
		link.innerText = 'DOWNLOAD: '+name;
		link.classList.add('link');
		link.setAttribute('download', name);
		link.setAttribute('href', dataURL);
		this.resultContainer.appendChild(link)
    }

	clearTransparentSpace()
	{
		let startX = 0, startY = 0,  endX = 0, endY = 0;
		let pinned = false; // if top left corner defined

		const w = this.canvasOne.width;
		const h = this.canvasOne.height;

		const imgData = this.ctxOne.getImageData(0, 0, w, h);

		for(let y = 0; y < h; y++){
			for(let x = 0; x < w; x++){
				let alphaVal = imgData.data[(y * (w * 4) + x * 4) + 3];
				
				if (alphaVal == 0) continue;
					
				if (!pinned)
				{
					if (startX == 0) startX = x
					if (startY == 0) startY = y
					pinned = true
				}
					
				if (!pinned) continue;

				if (x < startX) startX = x;

				if (x > endX) endX = x;
				if (y > endY) endY = y;
			}	
		}
		return [startX, startY, endX, endY];
	}

	clearWhiteSpace(){
		let startX = 0, startY = 0,  endX = 0, endY = 0;
		let pinned = false; // if top left corner defined

		const w = this.canvasOne.width;
		const h = this.canvasOne.height;

		const imgData = this.ctxOne.getImageData(0, 0, w, h);

		for(let y = 0; y < h; y++){
			for(let x = 0; x < w; x++){
				const coord = (y * (w * 4) + x * 4)
				const r = imgData.data[coord];
				const g = imgData.data[coord + 1];
				const b = imgData.data[coord + 2];

				if (r === 255 && g === 255 && b === 255) continue;
				
				if (!pinned)
				{
					if (startX == 0) startX = x
					if (startY == 0) startY = y
					pinned = true
				}
					
				if (!pinned) continue;

				if (x < startX) startX = x;

				if (x > endX) endX = x;
				if (y > endY) endY = y;
			}	
		}
		return [startX, startY, endX, endY];
	}

	convertWhiteSpaceToTransparent()
	{
		const w = this.canvasTwo.width;
		const h = this.canvasTwo.height;
		const imageData = this.ctxTwo.getImageData(0, 0, w, h); 
		const data = imageData.data;
		for(let y = 0; y < h; y++){
			for(let x = 0; x < w; x++){
				const coord = (y * (w * 4) + x * 4);
				const r = data[coord];
				const g = data[coord + 1];
				const b = data[coord + 2];
				const a = data[coord + 3];
				if (r === 255 && g === 255 && b === 255 && a === 255)
				{
					data[coord] = 0;
					data[coord + 1] = 0;
					data[coord + 2] = 0;
					data[coord + 3] = 0;
				}
				else
				{
					data[coord] = r;
					data[coord + 1] = g;
					data[coord + 2] = b;
					data[coord + 3] = a;
				}
			}
		}
		this.ctxTwo.putImageData(imageData, 0, 0);
	}
}