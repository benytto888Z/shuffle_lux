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

const calibrationStorage =
    new window.CalibrationStorage();


const calibrationManager =
    new window.CalibrationManager();


const homographyManager =
    new window.HomographyManager(
        calibrationManager
    );

const savedCalibration =
    calibrationStorage.loadOrDefault();

const lineCalibration =
    new window.LineCalibration(
        savedCalibration.lines
    );




const boardGeometry =
    new window.BoardGeometry({

        lengthM: savedCalibration.board.lengthM,

        widthM: savedCalibration.board.widthM,

        outputWidth: savedCalibration.vision.outputWidth,

        outputHeight: savedCalibration.vision.outputHeight,

        faultLineRatio: savedCalibration.geometry.faultLineRatio,

        zoneRatios: savedCalibration.geometry.zoneRatios,

        hangerRatio: savedCalibration.geometry.hangerRatio,

        lineColors: {

            zone: savedCalibration.lines.zoneColor,

            fault: savedCalibration.lines.faultColor,

            hanger: savedCalibration.lines.hangerColor
        },

        lineWidth: savedCalibration.lines.zoneLineWidth,

        faultLineWidth: savedCalibration.lines.faultLineWidth,

        hangerLineWidth: savedCalibration.lines.hangerLineWidth
    });

const puckDetector =
    new window.PuckDetector();

const gameRoundManager =
    new window.GameRoundManager({

        gameDuration: 10000,

        stabilizationDuration: 3000,

        onGameStart: () => {

            console.log(
                "🎮 GAME START"
            );
        },


        onGameFinish: () => {

            console.log(
                "⏳ FIN DU JEU — STABILISATION"
            );
        },


        onAnalysis: () => {

            console.log(
                "📸 ANALYSE DE LA POSITION FINALE"
            );

            analyzeFinalBoard();
        },


        onTick: (remainingTime) => {

            console.log(
                "Temps restant :",
                remainingTime / 1000,
                "s"
            );
        }
    });

    const boardCoordinateMapper =
    new window.BoardCoordinateMapper({

        pixelWidth: 1200,

        pixelHeight: 600,

        boardWidthMm: 1200,

        boardHeightMm: 600
    });

const zoneBoundariesMm =
    savedCalibration.geometry
        ?.zoneBoundariesMm ?? {

        foulLineX: 450,

        zone1EndX: 700,

        zone2EndX: 900,

        zone3EndX: 1050,

        zone4EndX: 1200
    };


const boardZones =
    new window.BoardZones({

        boardLength: 1200,

        boardWidth: 600,

        ...zoneBoundariesMm
    });


/*
 * Exposition temporaire pour les tests de l'ÉTAPE 34.
 * Aucune limite de zone n'est inventée ici.
 */

window.boardZones =
    boardZones;


console.log(
    "BoardZones initialisé :",
    boardZones.getStatus()
);

function analyzeFinalBoard() {

    console.log(
        "================================"
    );

    console.log(
        "📸 CAPTURE FINALE DE LA PLANCHE"
    );

    console.log(
        "================================"
    );


    let rectified = null;
    let finalBoardState = null;


    try {

        /*
         * 1. Capture + redressement
         */

        rectified =
            visionEngine.captureAndRectify();


        if (!rectified) {

            throw new Error(
                "Capture rectifiée indisponible."
            );
        }


        console.log(
            `Image rectifiée : ${rectified.cols} × ${rectified.rows}`
        );


        /*
         * 2. Vérification des dimensions
         */

        if (
            rectified.cols !== 1200 ||
            rectified.rows !== 600
        ) {

            throw new Error(
                `Dimensions incorrectes : ` +
                `${rectified.cols} × ${rectified.rows}`
            );
        }


        /*
         * 3. Détection des palets
         */

        const detections =
            puckDetector.detect(
                rectified
            );


        if (
            !Array.isArray(detections)
        ) {

            throw new Error(
                "Le détecteur n'a pas retourné un tableau."
            );
        }


        console.log(
            "================================"
        );

        console.log(
            "🔵🟢 DÉTECTIONS FINALES"
        );

        console.log(
            "================================"
        );


        console.log(
            "Palets détectés :",
            detections
        );


        /*
         * 4. Comptage des couleurs
         */

        const bluePucks =
            detections.filter(
                puck =>
                    puck.color === "blue"
            );


        const greenPucks =
            detections.filter(
                puck =>
                    puck.color === "green"
            );


        const blueCount =
            bluePucks.length;


        const greenCount =
            greenPucks.length;


        const total =
            detections.length;


        console.log(
            "🔵 BLEU :",
            blueCount
        );


        console.log(
            "🟢 VERT :",
            greenCount
        );


        console.log(
            "TOTAL :",
            total
        );


        /*
         * 5. Affichage des positions
         */

        detections.forEach(
            (puck, index) => {

                console.log(
                    `Palet #${index + 1}`,
                    {

                        color:
                            puck.color,

                        x:
                            puck.center?.x,

                        y:
                            puck.center?.y,

                        radius:
                            puck.radius,

                        diameter:
                            puck.diameter
                    }
                );
            }
        );


        /*
         * 6. Création du FinalBoardState
         */

        finalBoardState =
            new window.FinalBoardState(
                detections
            );


        /*
         * 7. Mapping physique puis classification des zones.
         *
         * Le mapping conserve les données pixels et ajoute :
         * mmX, mmY, radiusMm et diameterMm.
         */

        const mappedPucks =
            boardCoordinateMapper.mapPucks(
                finalBoardState.pucks
            );


        const classifiedPucks =
            boardZones.classifyPucks(
                mappedPucks
            );


        finalBoardState.setZoneAnalysis({
            mappedPucks,
            classifiedPucks
        });


        console.log(
            "================================"
        );

        console.log(
            "🎯 CLASSIFICATION DES ZONES"
        );

        console.log(
            "================================"
        );


        console.table(
            classifiedPucks.map(
                (puck, index) => ({
                    puck:
                        index + 1,

                    color:
                        puck.color,

                    mmX:
                        Number(
                            puck.mmX.toFixed(2)
                        ),

                    mmY:
                        Number(
                            puck.mmY.toFixed(2)
                        ),

                    zone:
                        puck.boardZone,

                    pointsZone:
                        puck.zoneScore
                })
            )
        );


        window.mappedFinalPucks =
            mappedPucks;

        window.classifiedFinalPucks =
            classifiedPucks;


        /*
         * 8. Exposition globale
         *
         * Permet de tester depuis
         * la console du navigateur.
         */

        window.finalBoardState =
            finalBoardState;


        /*
         * 8. État final
         */

        console.log(
            "================================"
        );

        console.log(
            "📋 FINAL BOARD STATE"
        );

        console.log(
            "================================"
        );


        console.log(
            finalBoardState.getStatus()
        );


        /*
         * 9. Données complètes
         */

        console.log(
            "DONNÉES FINALES :",
            finalBoardState.getData()
        );


        /*
         * 10. Validation
         */

        const countValidation = {
            blueValid:
                blueCount >= 0 &&
                blueCount <= 4,

            greenValid:
                greenCount >= 0 &&
                greenCount <= 4,

            totalValid:
                total >= 0 &&
                total <= 8
        };


        const variableCountValid =
            countValidation.blueValid &&
            countValidation.greenValid &&
            countValidation.totalValid;


        const validationLogger =
            variableCountValid
                ? (...args) =>
                    console.log(...args)
                : (...args) =>
                    console.warn(...args);


        validationLogger(
            "================================"
        );

        validationLogger(
            variableCountValid
                ? "✅ NOMBRE VARIABLE DE PALETS VALIDE"
                : "⚠️ NOMBRE DE PALETS IMPOSSIBLE"
        );

        validationLogger(
            `🔵 Bleus : ${blueCount} / maximum 4`
        );

        validationLogger(
            `🟢 Verts : ${greenCount} / maximum 4`
        );

        validationLogger(
            `Total : ${total} / maximum 8`
        );

        validationLogger(
            "================================"
        );


        /*
         * 11. Retourner l'état final
         */

        return finalBoardState;


    } catch (error) {

        console.error(
            "❌ ERREUR ANALYSE FINALE :",
            error
        );


        window.finalBoardState =
            null;


        return null;


    } finally {

        /*
         * IMPORTANT :
         * On libère uniquement la Mat OpenCV.
         */

        if (rectified) {

            rectified.delete();

            rectified = null;
        }
    }
}


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
            "Calibration chargée :",
            savedCalibration
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

function detectPucksDebug() {

    const rectified =
        visionEngine.captureAndRectify();


    try {

        const pucks =
            puckDetector.detect(
                rectified
            );


        console.log(
            "PALETS DÉTECTÉS :",
            pucks
        );


        /*
         * Canvas temporaire
         */

        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            rectified.cols;

        canvas.height =
            rectified.rows;


        cv.imshow(
            canvas,
            rectified
        );


        const ctx =
            canvas.getContext(
                "2d"
            );


        /*
         * Dessin des détections
         */

        puckDetector.drawDetections(
            ctx,
            pucks
        );


        /*
         * Canvas debug principal
         */

        const debugCanvas =
            document.getElementById(
                "opencv-debug-canvas"
            );


        if (!debugCanvas) {

            throw new Error(
                "opencv-debug-canvas introuvable."
            );
        }


        debugCanvas.width =
            rectified.cols;

        debugCanvas.height =
            rectified.rows;


        const debugContext =
            debugCanvas.getContext(
                "2d"
            );


        debugContext.clearRect(
            0,
            0,
            debugCanvas.width,
            debugCanvas.height
        );


        debugContext.drawImage(
            canvas,
            0,
            0
        );


        return pucks;


    } finally {

        rectified.delete();
    }
}

function debugGreenPucks() {

    const rectified =
        visionEngine.captureAndRectify();


    try {

        return puckDetector
            .debugColorDetection(
                rectified,
                "green"
            );

    } finally {

        rectified.delete();
    }
}

function debugGreenContours() {

    const rectified =
        visionEngine.captureAndRectify();


    try {

        puckDetector
            .debugGreenContours(
                rectified
            );

    } finally {

        rectified.delete();
    }
}

function showBoardCoordinates() {

    if (!window.finalBoardState) {

        console.warn(
            "Aucun FinalBoardState disponible."
        );

        return;
    }


const canvas =
    document.getElementById(
        "opencv-debug-canvas"
    );


    if (!canvas) {

        console.error(
            "Canvas debug introuvable."
        );

        return;
    }


    const ctx =
        canvas.getContext("2d");


    /*
     * Dimensions physiques
     */

    const boardWidth = 1200;
    const boardHeight = 600;


    /*
     * Adapter le canvas
     */

    canvas.width =
        boardWidth;

    canvas.height =
        boardHeight;


    /*
     * Fond
     */

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
     * Cadre de la planche
     */

    ctx.strokeStyle =
        "#ffffff";

    ctx.lineWidth = 3;

    ctx.strokeRect(
        0,
        0,
        boardWidth,
        boardHeight
    );


    /*
     * Axes
     */

    ctx.beginPath();

    ctx.moveTo(
        0,
        0
    );

    ctx.lineTo(
        boardWidth,
        0
    );

    ctx.moveTo(
        0,
        0
    );

    ctx.lineTo(
        0,
        boardHeight
    );

    ctx.stroke();


    /*
     * Texte origine
     */

    ctx.font =
        "18px Arial";

    ctx.fillStyle =
        "#ffffff";

    ctx.fillText(
        "(0, 0)",
        10,
        25
    );


    /*
     * Coordonnées maximum
     */

    ctx.fillText(
        "1200 mm",
        boardWidth - 100,
        25
    );


    ctx.fillText(
        "600 mm",
        10,
        boardHeight - 10
    );


    /*
     * Mapper les pucks
     */

    const mapper =
        boardCoordinateMapper;


    const pucks =
        window.finalBoardState.pucks;


    pucks.forEach(
        (puck, index) => {

            const mapped =
                mapper.mapPuck(
                    puck
                );


            if (!mapped) {

                return;
            }


            const x =
                mapped.mmX;


            const y =
                mapped.mmY;


            /*
             * Cercle du puck
             */

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                Math.max(
                    puck.radius || 20,
                    10
                ),
                0,
                Math.PI * 2
            );


            ctx.strokeStyle =
                puck.color === "blue"
                    ? "#00aaff"
                    : "#00ff66";


            ctx.lineWidth = 3;

            ctx.stroke();


            /*
             * Centre
             */

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#ffffff";

            ctx.fill();


            /*
             * Coordonnées
             */

            ctx.font =
                "14px Arial";

            ctx.fillStyle =
                "#ffffff";


            ctx.fillText(
                `#${index + 1} ${Math.round(x)} × ${Math.round(y)} mm`,
                x + 12,
                y - 10
            );
        }
    );


    console.log(
        "✅ Repère physique affiché."
    );
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

        x: (event.clientX - rect.left) *
            scaleX,

        y: (event.clientY - rect.top) *
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

        zone: config.zoneColor,

        fault: config.faultColor,

        hanger: config.hangerColor

    });


    boardGeometry.lineWidth =
        config.zoneLineWidth;


    boardGeometry.faultLineWidth =
        config.faultLineWidth;


    boardGeometry.hangerLineWidth =
        config.hangerLineWidth;
}

function saveCalibration() {

    const config = {

        version: 1,

        board: boardGeometry
            .getPhysicalDimensions(),

        vision: boardGeometry
            .getOutputDimensions(),

        geometry: {

            faultLineRatio: boardGeometry
                .faultLineRatio,

            zoneRatios: {
                ...boardGeometry
                .zoneRatios
            },

            zoneBoundariesMm:
                boardZones.getConfiguration(),

            hangerRatio: boardGeometry
                .hangerRatio
        },

        lines: lineCalibration
            .getConfig()
    };


    calibrationStorage.save(
        config
    );


    console.log(
        "Calibration sauvegardée :",
        config
    );


    return config;
}

function loadCalibration() {

    const config =
        calibrationStorage.load();


    if (!config) {

        console.warn(
            "Aucune calibration sauvegardée."
        );

        return null;
    }


    boardGeometry.setPhysicalDimensions(

        config.board.lengthM,

        config.board.widthM
    );


    boardGeometry.outputWidth =
        config.vision.outputWidth;

    boardGeometry.outputHeight =
        config.vision.outputHeight;


    boardGeometry.setFaultLineRatio(
        config.geometry.faultLineRatio
    );


    boardGeometry.setZoneRatios(

        config.geometry.zoneRatios.zone1,

        config.geometry.zoneRatios.zone2,

        config.geometry.zoneRatios.zone3,

        config.geometry.zoneRatios.zone4
    );


    boardGeometry.setHangerRatio(
        config.geometry.hangerRatio
    );


    if (
        config.geometry.zoneBoundariesMm
    ) {

        boardZones.configure(
            config.geometry.zoneBoundariesMm
        );
    }


    lineCalibration.loadConfig(
        config.lines
    );


    applyLineCalibration();


    console.log(
        "Calibration rechargée :",
        config
    );


    return config;
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