const { YoutubeTranscript } = require('youtube-transcript');

const extractVideoId = (url) => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    throw new Error('URL do YouTube inválida');
};

const getYouTubeTranscript = async (youtubeUrl) => {
    try {
        const videoId = extractVideoId(youtubeUrl);
        console.log(` Extraindo transcrição do vídeo: ${videoId}`);

        let transcript;
        try {
            transcript = await YoutubeTranscript.fetchTranscript(videoId, {
                lang: 'pt',
                country: 'BR'
            });
        } catch (error) {
            console.log(' Legendas em português não encontradas, tentando inglês...');
            transcript = await YoutubeTranscript.fetchTranscript(videoId, {
                lang: 'en'
            });
        }

        if (!transcript || transcript.length === 0) {
            throw new Error('Nenhuma transcrição disponível para este vídeo');
        }

        const fullText = transcript
            .map(item => item.text)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

        console.log(` Transcrição extraída: ${fullText.length} caracteres`);

        return {
            text: fullText,
            duration: transcript[transcript.length - 1]?.offset || 0,
            videoId
        };

    } catch (error) {
        console.error(' Erro ao extrair transcrição do YouTube:', error.message);

        if (error.message.includes('Transcript is disabled')) {
            throw new Error('As legendas estão desabilitadas para este vídeo');
        }
        if (error.message.includes('Could not find')) {
            throw new Error('Não foi possível encontrar legendas para este vídeo. Verifique se as legendas estão disponíveis.');
        }

        throw new Error(`Não foi possível processar o vídeo: ${error.message}`);
    }
};

module.exports = {
    getYouTubeTranscript,
    extractVideoId
};
