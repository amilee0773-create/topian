document.addEventListener('DOMContentLoaded', () => {
    const imageLoader = document.getElementById('image-loader');
    const dropZone = document.getElementById('drop-zone');
    const subtitleHeightInput = document.getElementById('subtitle-height');
    const fontSizeInput = document.getElementById('font-size');
    const fontColorInput = document.getElementById('font-color');
    const bgColorInput = document.getElementById('bg-color');
    const subtitleTextInput = document.getElementById('subtitle-text');
    const generateBtn = document.getElementById('generate-btn');
    const saveBtn = document.getElementById('save-btn');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let currentImage = null;

    // --- New File Handling Logic ---
    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                // Display the original image temporarily before generation
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                dropZone.style.display = 'none'; // Hide drop zone
                canvas.style.display = 'block'; // Show canvas
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    dropZone.addEventListener('click', () => imageLoader.click());
    imageLoader.addEventListener('change', (e) => handleFile(e.target.files[0]));

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });
    // --- End of New File Handling ---

    generateBtn.addEventListener('click', () => {
        if (!currentImage) {
            alert('请先选择一张图片！');
            return;
        }

        const subtitles = subtitleTextInput.value.split('\n').filter(line => line.trim() !== '');
        if (subtitles.length === 0) {
            // If no text, just show the original image
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            ctx.drawImage(currentImage, 0, 0);
            return;
        }

        const subtitleHeight = parseInt(subtitleHeightInput.value, 10);
        const fontSize = parseInt(fontSizeInput.value, 10);
        const fontColor = fontColorInput.value;
        const bgColor = bgColorInput.value;

        const sliceY = currentImage.height - subtitleHeight;

        if (sliceY < 0) {
            alert('图片高度不足以进行切割，请减小字幕高度！');
            return;
        }

        canvas.width = currentImage.width;
        canvas.height = currentImage.height + (subtitles.length * subtitleHeight);

        ctx.drawImage(currentImage, 0, 0);

        ctx.font = `${fontSize}px 'Noto Sans SC', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        subtitles.forEach((line, index) => {
            const targetY = currentImage.height + (index * subtitleHeight);

            ctx.drawImage(
                currentImage,
                0, sliceY, currentImage.width, subtitleHeight,
                0, targetY, canvas.width, subtitleHeight
            );

            ctx.globalAlpha = 0.5;
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, targetY, canvas.width, subtitleHeight);
            ctx.globalAlpha = 1.0;

            ctx.fillStyle = fontColor;
            ctx.fillText(line, canvas.width / 2, targetY + subtitleHeight / 2);
        });
    });

    saveBtn.addEventListener('click', () => {
        if (!currentImage) {
            alert('没有可保存的图片！');
            return;
        }
        const link = document.createElement('a');
        link.download = 'subtitle-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});