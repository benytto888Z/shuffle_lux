const cameraPreview =
    document.getElementById(
        "camera-preview"
    );


const cameraStatus =
    document.querySelector(
        ".camera-status"
    );


const cameraManager =
    new window.CameraManager({

        width: 1920,

        height: 1080,

        fps: 30

    });


const calibrationManager =
    new window.CalibrationManager();


const homographyManager =
    new window.HomographyManager(
        calibrationManager
    );

    const boardGeometry =
    new window.BoardGeometry({

        lengthM: 1.20,

        widthM: 0.60,

        outputWidth: 1200,

        outputHeight: 600

    });

    const lineCalibration =
    new window.LineCalibration();


const visionEngine =
    new window.VisionEngine({

        cameraManager,

        calibrationManager,

        homographyManager,

          boardGeometry

    });


async function initializeCamera() {

    try {

        cameraManager.initialize(
            cameraPreview
        );


        cameraStatus.textContent =
            "CAMERA STARTING...";


        await cameraManager.start();


        homographyManager.initialize();


        visionEngine.initialize();


        const status =
            cameraManager.getStatus();


        cameraStatus.textContent =
            `CAMERA ONLINE · ${status.width} × ${status.height} · ${status.fps} FPS`;


        console.log(
            "CameraManager:",
            cameraManager.getStatus()
        );


        console.log(
            "CalibrationManager:",
            calibrationManager
        );


        console.log(
            "HomographyManager:",
            homographyManager
        );


        console.log(
            "VisionEngine:",
            visionEngine.getStatus()
        );


    } catch (error) {

        console.error(
            "Camera / Vision initialization error:",
            error
        );


        cameraStatus.textContent =
            "CAMERA / VISION ERROR";
    }
}

function showBoardGeometry() {

    const rectified =
        visionEngine.captureAndRectify();


    try {

        const width =
            rectified.cols;

        const height =
            rectified.rows;


        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            width;

        canvas.height =
            height;


        const context =
            canvas.getContext(
                "2d"
            );


        cv.imshow(
            canvas,
            rectified
        );


        boardGeometry.drawDebug(
            context
        );


        const debugCanvas =
            document.getElementById(
                "opencv-debug-canvas"
            );


        debugCanvas.width =
            width;

        debugCanvas.height =
            height;


        const debugContext =
            debugCanvas.getContext(
                "2d"
            );


        debugContext.clearRect(
            0,
            0,
            width,
            height
        );


        debugContext.drawImage(
            canvas,
            0,
            0
        );


    } finally {

        rectified.delete();
    }
}


document.addEventListener(
    "DOMContentLoaded",
    initializeCamera
);

const calibrationCanvas =
    document.getElementById(
        "opencv-debug-canvas"
    );

let calibrationMode = false;

let calibrationPoints = [];


function startCalibration() {

    if (!calibrationCanvas) {

        console.error(
            "Canvas de calibration introuvable."
        );

        return;
    }


    calibrationMode = true;

    calibrationPoints = [];


    calibrationManager.clearSourcePoints();


    updateCalibrationStatus();


    calibrationCanvas.style.cursor =
        "crosshair";


    try {

        visionEngine.testOpenCVDisplay();

        console.log(
            "Image caméra affichée dans le canvas de calibration."
        );

    } catch (error) {

        console.error(
            "Erreur capture OpenCV :",
            error
        );
    }


    console.log(
        "Calibration démarrée."
    );
}


function stopCalibration() {

    calibrationMode = false;


    calibrationCanvas.style.cursor =
        "default";
}


function updateCalibrationStatus() {

    const status =
        document.getElementById(
            "calibration-status"
        );


    if (!status) {

        return;
    }


    status.textContent =
        `${calibrationPoints.length} / 4`;
}


function getCanvasCoordinates(
    event
) {

    const rect =
        calibrationCanvas.getBoundingClientRect();


    const scaleX =
        calibrationCanvas.width /
        rect.width;


    const scaleY =
        calibrationCanvas.height /
        rect.height;


    return {

        x:
            (event.clientX - rect.left) *
            scaleX,

        y:
            (event.clientY - rect.top) *
            scaleY
    };
}


function handleCalibrationClick(event) {

    if (!calibrationMode) {
        return;
    }


    if (calibrationPoints.length >= 4) {
        return;
    }


    const point =
        getCanvasCoordinates(event);


    calibrationPoints.push(point);


    updateCalibrationStatus();


    console.log(
        `Point ${calibrationPoints.length} :`,
        point
    );


    /*
     * On attend d'avoir les 4 points
     * avant de les envoyer au
     * CalibrationManager.
     */

    if (calibrationPoints.length === 4) {

        try {

            calibrationManager.setSourcePoints(
                calibrationPoints
            );


            calibrationManager.markCalibrated();


            homographyManager.setSourcePoints(
                calibrationPoints
            );


            homographyManager.build();


            console.log(
                "Calibration terminée."
            );


            console.log(
                "CalibrationManager:",
                calibrationManager.getStatus()
            );


            console.log(
                "HomographyManager:",
                homographyManager.getStatus()
            );


            /*
             * Affichage automatique
             * de la planche rectifiée.
             */

            visionEngine.showRectifiedFrame();


            stopCalibration();


        } catch (error) {

            console.error(
                "Erreur calibration :",
                error
            );
        }
    }
}


function resetCalibration() {

    calibrationPoints = [];


    calibrationManager.clearSourcePoints();


    homographyManager.invalidate();


    updateCalibrationStatus();


    calibrationMode = false;


    calibrationCanvas.style.cursor =
        "default";


    console.log(
        "Calibration réinitialisée."
    );
}

function applyLineCalibration() {

    const config =
        lineCalibration.getConfig();


    boardGeometry.setLineColors({

        zone:
            config.zoneColor,

        fault:
            config.faultColor,

        hanger:
            config.hangerColor

    });


    boardGeometry.lineWidth =
        config.zoneLineWidth;


    boardGeometry.faultLineWidth =
        config.faultLineWidth;


    boardGeometry.hangerLineWidth =
        config.hangerLineWidth;
}


if (calibrationCanvas) {

    calibrationCanvas.addEventListener(
        "click",
        handleCalibrationClick
    );
}


const calibrationStartButton =
    document.getElementById(
        "calibration-start"
    );


if (calibrationStartButton) {

    calibrationStartButton.addEventListener(
        "click",
        startCalibration
    );
}


const calibrationResetButton =
    document.getElementById(
        "calibration-reset"
    );


if (calibrationResetButton) {

    calibrationResetButton.addEventListener(
        "click",
        resetCalibration
    );
}