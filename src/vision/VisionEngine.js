class VisionEngine {

    constructor({
        cameraManager,
        calibrationManager,
        homographyManager
    } = {}) {

        this.cameraManager =
            cameraManager || null;

        this.calibrationManager =
            calibrationManager || null;

        this.homographyManager =
            homographyManager || null;

        this.captureCanvas = null;

        this.captureContext = null;

        this.debugCanvas = null;

        this.initialized = false;
    }


    initialize() {

        if (!this.cameraManager) {

            throw new Error(
                "VisionEngine: CameraManager manquant."
            );
        }


        if (
            typeof cv === "undefined"
        ) {

            throw new Error(
                "VisionEngine: OpenCV.js non disponible."
            );
        }


        this.createCaptureCanvas();

        this.createDebugCanvas();

        this.initialized = true;

        console.log(
            "VisionEngine initialized."
        );
    }


    createCaptureCanvas() {

        if (this.captureCanvas) {
            return;
        }


        this.captureCanvas =
            document.createElement("canvas");


        this.captureCanvas.id =
            "opencv-capture-canvas";


        this.captureCanvas.style.display =
            "none";


        document.body.appendChild(
            this.captureCanvas
        );


        this.captureContext =
            this.captureCanvas.getContext(
                "2d",
                {
                    willReadFrequently: true
                }
            );
    }


    createDebugCanvas() {

        this.debugCanvas =
            document.getElementById(
                "opencv-debug-canvas"
            );


        if (!this.debugCanvas) {

            this.debugCanvas =
                document.createElement(
                    "canvas"
                );


            this.debugCanvas.id =
                "opencv-debug-canvas";


            document.body.appendChild(
                this.debugCanvas
            );
        }


        this.debugCanvas.style.position =
            "fixed";

        this.debugCanvas.style.left =
            "1vw";

        this.debugCanvas.style.bottom =
            "1vh";

        this.debugCanvas.style.width =
            "80vw";

        this.debugCanvas.style.height =
            "auto";

        this.debugCanvas.style.zIndex =
            "9999";

        this.debugCanvas.style.background =
            "#000";

        this.debugCanvas.style.border =
            ".15em solid #00ff00";

        this.debugCanvas.style.objectFit =
            "contain";
    }


    getVideoElement() {

        if (!this.cameraManager) {
            return null;
        }


        if (
            this.cameraManager.video
        ) {
            return this.cameraManager.video;
        }


        if (
            this.cameraManager.videoElement
        ) {
            return this.cameraManager.videoElement;
        }


        if (
            typeof this.cameraManager
                .getVideoElement === "function"
        ) {

            return this.cameraManager
                .getVideoElement();
        }


        return document.getElementById(
            "camera-preview"
        );
    }


    captureFrame() {

        if (!this.initialized) {

            throw new Error(
                "VisionEngine non initialisé."
            );
        }


        const video =
            this.getVideoElement();


        if (!video) {

            throw new Error(
                "VisionEngine: caméra introuvable."
            );
        }


        const width =
            video.videoWidth;


        const height =
            video.videoHeight;


        if (
            width <= 0 ||
            height <= 0
        ) {

            throw new Error(
                "VisionEngine: dimensions caméra invalides."
            );
        }


        this.captureCanvas.width =
            width;

        this.captureCanvas.height =
            height;


        this.captureContext.drawImage(

            video,

            0,
            0,

            width,
            height
        );


        const frame =
            cv.imread(
                this.captureCanvas
            );


        if (
            !frame ||
            frame.empty()
        ) {

            if (frame) {
                frame.delete();
            }


            throw new Error(
                "VisionEngine: frame OpenCV vide."
            );
        }


        return frame;
    }


    showFrame(frame) {

        if (
            !frame ||
            frame.empty()
        ) {

            throw new Error(
                "VisionEngine: Mat invalide."
            );
        }


        this.debugCanvas.width =
            frame.cols;

        this.debugCanvas.height =
            frame.rows;


        this.debugCanvas.style.aspectRatio =
            `${frame.cols} / ${frame.rows}`;


        cv.imshow(
            this.debugCanvas,
            frame
        );
    }


    captureAndRectify() {

        if (!this.homographyManager) {

            throw new Error(
                "HomographyManager manquant."
            );
        }


        const frame =
            this.captureFrame();


        try {

            return this.homographyManager
                .rectify(frame);

        } finally {

            frame.delete();
        }
    }


    showRectifiedFrame() {

        const rectified =
            this.captureAndRectify();


        try {

            this.showFrame(
                rectified
            );

        } finally {

            rectified.delete();
        }
    }


    testOpenCVDisplay() {

        const frame =
            this.captureFrame();


        try {

            this.showFrame(
                frame
            );

        } finally {

            frame.delete();
        }
    }


    getStatus() {

        const video =
            this.getVideoElement();


        return {

            initialized:
                this.initialized,

            openCV:
                typeof cv !== "undefined",

            camera:

                video
                    ? {

                        width:
                            video.videoWidth,

                        height:
                            video.videoHeight,

                        readyState:
                            video.readyState,

                        paused:
                            video.paused

                    }
                    : null,

            debugCanvas:
                !!this.debugCanvas
        };
    }


    destroy() {

        if (
            this.captureCanvas
        ) {

            this.captureCanvas.remove();

            this.captureCanvas =
                null;

            this.captureContext =
                null;
        }


        this.initialized =
            false;
    }
}


window.VisionEngine =
    VisionEngine;