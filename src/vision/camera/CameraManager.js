class CameraManager {

    constructor(config = {}) {

        this.config = {
            width: config.width ?? 1920,
            height: config.height ?? 1080,
            fps: config.fps ?? 30,

            facingMode: config.facingMode ?? "environment"
        };

        this.videoElement = null;

        this.stream = null;

        this.running = false;

        this.lastFrame = null;
    }


    /**
     * Initialise l'élément vidéo utilisé
     * pour afficher le flux caméra.
     */
    initialize(videoElement) {

        if (!videoElement) {
            throw new Error(
                "CameraManager: videoElement obligatoire."
            );
        }

        this.videoElement = videoElement;

        this.videoElement.autoplay = true;
        this.videoElement.muted = true;
        this.videoElement.playsInline = true;
    }


    /**
     * Demande l'accès à la caméra.
     */
    async start() {

        if (!this.videoElement) {
            throw new Error(
                "CameraManager: initialize() doit être appelé avant start()."
            );
        }

        if (this.running) {
            return;
        }

        const constraints = {

            video: {
                width: {
                    ideal: this.config.width
                },

                height: {
                    ideal: this.config.height
                },

                frameRate: {
                    ideal: this.config.fps
                },

                facingMode:
                    this.config.facingMode
            },

            audio: false
        };


        try {

            this.stream =
                await navigator.mediaDevices.getUserMedia(
                    constraints
                );

            this.videoElement.srcObject =
                this.stream;

            await this.videoElement.play();

            this.running = true;

            console.log(
                "CameraManager: caméra démarrée."
            );

            this.logActualSettings();

        } catch (error) {

            console.error(
                "CameraManager: impossible d'accéder à la caméra.",
                error
            );

            throw error;
        }
    }


    /**
     * Arrête complètement le flux caméra.
     */
    stop() {

        if (!this.stream) {
            return;
        }

        for (const track of this.stream.getTracks()) {

            track.stop();
        }

        this.stream = null;

        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }

        this.running = false;

        console.log(
            "CameraManager: caméra arrêtée."
        );
    }


    /**
     * Retourne l'état actuel de la caméra.
     */
    getStatus() {

        return {

            running: this.running,

            hasStream:
                Boolean(this.stream),

            width:
                this.config.width,

            height:
                this.config.height,

            fps:
                this.config.fps
        };
    }


    /**
     * Retourne les paramètres réellement
     * appliqués par le périphérique.
     */
    getActualSettings() {

        if (!this.stream) {
            return null;
        }

        const tracks =
            this.stream.getVideoTracks();

        if (!tracks.length) {
            return null;
        }

        return tracks[0].getSettings();
    }


    /**
     * Affiche les paramètres réels de la caméra.
     */
    logActualSettings() {

        const settings =
            this.getActualSettings();

        console.log(
            "CameraManager: paramètres réels :",
            settings
        );
    }


    /**
     * Capture l'image actuelle du flux vidéo.
     *
     * Cette méthode ne fait encore aucun
     * traitement OpenCV.
     */
    captureFrame() {

        if (!this.videoElement) {
            throw new Error(
                "CameraManager: aucune vidéo initialisée."
            );
        }

        if (
            this.videoElement.readyState <
            HTMLMediaElement.HAVE_CURRENT_DATA
        ) {

            throw new Error(
                "CameraManager: image vidéo non disponible."
            );
        }


        const canvas =
            document.createElement("canvas");

        canvas.width =
            this.videoElement.videoWidth;

        canvas.height =
            this.videoElement.videoHeight;


        const context =
            canvas.getContext("2d", {
                willReadFrequently: true
            });


        context.drawImage(
            this.videoElement,
            0,
            0,
            canvas.width,
            canvas.height
        );


        const frame = {

            canvas,

            width: canvas.width,

            height: canvas.height,

            timestamp: Date.now()
        };


        this.lastFrame = frame;

        return frame;
    }


    /**
     * Capture et retourne une image
     * sous forme de Blob.
     */
    async captureBlob(
        type = "image/jpeg",
        quality = 0.95
    ) {

        const frame =
            this.captureFrame();


        return new Promise(
            (resolve, reject) => {

                frame.canvas.toBlob(
                    blob => {

                        if (!blob) {

                            reject(
                                new Error(
                                    "CameraManager: impossible de créer le Blob."
                                )
                            );

                            return;
                        }

                        resolve(blob);
                    },

                    type,

                    quality
                );
            }
        );
    }


    /**
     * Capture officielle du tour.
     */
    captureScoreFrame() {

        const frame =
            this.captureFrame();

        console.log(
            "CameraManager: capture SCORE",
            {
                timestamp: frame.timestamp,
                width: frame.width,
                height: frame.height
            }
        );

        return frame;
    }


    /**
     * Vérifie si la caméra est disponible.
     */
    isRunning() {

        return this.running;
    }


    /**
     * Nettoyage.
     */
    destroy() {

        this.stop();

        this.videoElement = null;

        this.lastFrame = null;
    }
}


window.CameraManager = CameraManager;