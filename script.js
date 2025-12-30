const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: false });

const videoInput = document.getElementById('videoInput');
const dropZone = document.getElementById('dropZone');
const convertBtn = document.getElementById('convertBtn');
const status = document.getElementById('status');
const progress = document.getElementById('progress');
const progArea = document.getElementById('progArea');
const fileNameSpan = document.getElementById('fileName');

dropZone.onclick = () => videoInput.click();

videoInput.onchange = (e) => {
    if (e.target.files[0]) fileNameSpan.innerText = e.target.files[0].name;
};

convertBtn.onclick = async () => {
    const file = videoInput.files[0];
    if (!file) return alert("Por favor, selecione um vídeo!");

    convertBtn.disabled = true;
    progArea.style.display = 'block';
    
    if (!ffmpeg.isLoaded()) {
        status.innerText = "Inicializando motor de conversão...";
        await ffmpeg.load();
    }

    status.innerText = "Carregando arquivo...";
    ffmpeg.FS('writeFile', 'input', await fetchFile(file));

    const format = document.getElementById('formatSelect').value;
    let args = [];
    let outName = "convertido";

    // Configuração de comandos baseada na escolha
    if (format === 'mp3') {
        args = ['-i', 'input', '-vn', '-ab', '192k', 'output.mp3'];
        outName += ".mp3";
    } else if (format === 'wav') {
        args = ['-i', 'input', '-vn', 'output.wav'];
        outName += ".wav";
    } else {
        const resMap = { '480p': '854x480', '720p': '1280x720', '1080p': '1920x1080' };
        args = ['-i', 'input', '-vcodec', 'libx264', '-crf', '28', '-s', resMap[format], 'output.mp4'];
        outName += ".mp4";
    }

    ffmpeg.setProgress(({ ratio }) => {
        const p = (ratio * 100).toFixed(0);
        progress.style.width = `${p}%`;
        status.innerText = `Processando: ${p}%`;
    });

    await ffmpeg.run(...args);

    const data = ffmpeg.FS('readFile', args[args.length - 1]);
    const type = format.includes('p') ? 'video/mp4' : 'audio/mpeg';
    const url = URL.createObjectURL(new Blob([data.buffer], { type }));

    status.innerHTML = `<a href="${url}" download="${outName}" class="download-btn">⬇️ Baixar Agora</a>`;
    convertBtn.disabled = false;
};