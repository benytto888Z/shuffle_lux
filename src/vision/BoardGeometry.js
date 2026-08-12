class BoardGeometry {

    constructor(config = {}) {

        /*
         * =====================================================
         * DIMENSIONS PHYSIQUES
         * =====================================================
         *
         * Ces valeurs peuvent changer d'une machine à l'autre.
         *
         * Prototype :
         * longueur = 1.20 m
         * largeur  = 0.60 m
         */

        this.lengthM =
            config.lengthM ?? 1.20;

        this.widthM =
            config.widthM ?? 0.60;


        this.validatePhysicalDimensions();


        /*
         * =====================================================
         * ESPACE NORMALISÉ DE VISION
         * =====================================================
         *
         * IMPORTANT :
         *
         * Ces valeurs NE représentent PAS les dimensions
         * physiques de la planche.
         *
         * Elles constituent notre espace de calcul OpenCV.
         */

        this.outputWidth =
            config.outputWidth ?? 1200;

        this.outputHeight =
            config.outputHeight ?? 600;


        this.validateOutputDimensions();


        /*
         * =====================================================
         * LIGNE DE FAUTE
         * =====================================================
         */

        this.faultLineRatio =
            config.faultLineRatio ?? 0.20;


        /*
         * =====================================================
         * ZONES
         * =====================================================
         */

        this.zoneRatios = {

            zone1:
                config.zoneRatios?.zone1 ?? 0.40,

            zone2:
                config.zoneRatios?.zone2 ?? 0.60,

            zone3:
                config.zoneRatios?.zone3 ?? 0.80,

            zone4:
                config.zoneRatios?.zone4 ?? 0.90
        };


        /*
         * =====================================================
         * HANGER
         * =====================================================
         */

        this.hangerRatio =
            config.hangerRatio ?? 0.95;


        /*
         * =====================================================
         * COULEURS
         * =====================================================
         */

        this.lineColors = {

            zone:
                config.lineColors?.zone ??
                "#ffffff",

            fault:
                config.lineColors?.fault ??
                "#000000",

            hanger:
                config.lineColors?.hanger ??
                "#ffd700"
        };


        /*
         * =====================================================
         * ÉPAISSEURS
         * =====================================================
         */

        this.lineWidth =
            config.lineWidth ?? 3;

        this.faultLineWidth =
            config.faultLineWidth ?? 3;

        this.hangerLineWidth =
            config.hangerLineWidth ?? 5;


        this.initialized = true;
    }


    /*
     * =========================================================
     * VALIDATION DIMENSIONS PHYSIQUES
     * =========================================================
     */

    validatePhysicalDimensions() {

        if (
            !Number.isFinite(this.lengthM) ||
            this.lengthM <= 0
        ) {

            throw new Error(
                "Longueur physique invalide."
            );
        }


        if (
            !Number.isFinite(this.widthM) ||
            this.widthM <= 0
        ) {

            throw new Error(
                "Largeur physique invalide."
            );
        }
    }


    /*
     * =========================================================
     * VALIDATION ESPACE DE CALCUL
     * =========================================================
     */

    validateOutputDimensions() {

        if (
            !Number.isFinite(
                this.outputWidth
            ) ||
            this.outputWidth <= 0
        ) {

            throw new Error(
                "OutputWidth invalide."
            );
        }


        if (
            !Number.isFinite(
                this.outputHeight
            ) ||
            this.outputHeight <= 0
        ) {

            throw new Error(
                "OutputHeight invalide."
            );
        }
    }


    /*
     * =========================================================
     * MODIFICATION DIMENSIONS PHYSIQUES
     * =========================================================
     */

    setPhysicalDimensions(
        lengthM,
        widthM
    ) {

        if (
            !Number.isFinite(lengthM) ||
            lengthM <= 0
        ) {

            throw new Error(
                "Longueur physique invalide."
            );
        }


        if (
            !Number.isFinite(widthM) ||
            widthM <= 0
        ) {

            throw new Error(
                "Largeur physique invalide."
            );
        }


        this.lengthM =
            lengthM;

        this.widthM =
            widthM;
    }


    /*
     * =========================================================
     * DIMENSIONS PHYSIQUES
     * =========================================================
     */

    getPhysicalDimensions() {

        return {

            lengthM:
                this.lengthM,

            widthM:
                this.widthM
        };
    }


    /*
     * =========================================================
     * DIMENSIONS NORMALISÉES
     * =========================================================
     */

    getOutputDimensions() {

        return {

            width:
                this.outputWidth,

            height:
                this.outputHeight
        };
    }


    /*
     * =========================================================
     * CONVERSION RATIO → PIXEL
     * =========================================================
     */

    ratioToPixel(ratio) {

        return (
            ratio *
            this.outputWidth
        );
    }


    /*
     * =========================================================
     * PIXEL → RATIO
     * =========================================================
     */

    pixelToRatio(pixel) {

        return (
            pixel /
            this.outputWidth
        );
    }


    /*
     * =========================================================
     * PIXEL → MÈTRE
     *
     * Axe X = longueur
     * Axe Y = largeur
     * =========================================================
     */

    pixelToMeters(
        x,
        y
    ) {

        return {

            x:
                (
                    x /
                    this.outputWidth
                ) *
                this.lengthM,

            y:
                (
                    y /
                    this.outputHeight
                ) *
                this.widthM
        };
    }


    /*
     * =========================================================
     * MÈTRE → PIXEL
     * =========================================================
     */

    metersToPixel(
        xM,
        yM
    ) {

        return {

            x:
                (
                    xM /
                    this.lengthM
                ) *
                this.outputWidth,

            y:
                (
                    yM /
                    this.widthM
                ) *
                this.outputHeight
        };
    }


    /*
     * =========================================================
     * LIGNE DE FAUTE
     * =========================================================
     */

    getFaultLineX() {

        return this.ratioToPixel(
            this.faultLineRatio
        );
    }


    /*
     * =========================================================
     * ZONES
     * =========================================================
     */

    getZoneBoundaries() {

        return {

            zone1:
                this.ratioToPixel(
                    this.zoneRatios.zone1
                ),

            zone2:
                this.ratioToPixel(
                    this.zoneRatios.zone2
                ),

            zone3:
                this.ratioToPixel(
                    this.zoneRatios.zone3
                ),

            zone4:
                this.ratioToPixel(
                    this.zoneRatios.zone4
                )
        };
    }


    /*
     * =========================================================
     * HANGER
     * =========================================================
     */

    getHangerBoundary() {

        return this.ratioToPixel(
            this.hangerRatio
        );
    }


    /*
     * =========================================================
     * ZONES EN MÈTRES
     * =========================================================
     */

    getZoneBoundariesMeters() {

        return {

            zone1:
                this.zoneRatios.zone1 *
                this.lengthM,

            zone2:
                this.zoneRatios.zone2 *
                this.lengthM,

            zone3:
                this.zoneRatios.zone3 *
                this.lengthM,

            zone4:
                this.zoneRatios.zone4 *
                this.lengthM
        };
    }


    /*
     * =========================================================
     * HANGER EN MÈTRES
     * =========================================================
     */

    getHangerBoundaryMeters() {

        return (
            this.hangerRatio *
            this.lengthM
        );
    }


    /*
     * =========================================================
     * ZONES
     * =========================================================
     */

    setZoneRatios(
        zone1,
        zone2,
        zone3,
        zone4
    ) {

        const values = [
            zone1,
            zone2,
            zone3,
            zone4
        ];


        if (
            values.some(
                value =>
                    !Number.isFinite(value)
            )
        ) {

            throw new Error(
                "Ratios de zones invalides."
            );
        }


        if (
            zone1 <= 0 ||
            zone2 <= zone1 ||
            zone3 <= zone2 ||
            zone4 <= zone3 ||
            zone4 >= 1
        ) {

            throw new Error(
                "Les limites des zones doivent être croissantes."
            );
        }


        this.zoneRatios = {

            zone1,
            zone2,
            zone3,
            zone4
        };
    }


    /*
     * =========================================================
     * HANGER
     * =========================================================
     */

    setHangerRatio(ratio) {

        if (
            !Number.isFinite(ratio) ||
            ratio <= this.zoneRatios.zone4 ||
            ratio >= 1
        ) {

            throw new Error(
                "Position HANGER invalide."
            );
        }


        this.hangerRatio =
            ratio;
    }


    /*
     * =========================================================
     * LIGNE DE FAUTE
     * =========================================================
     */

    setFaultLineRatio(ratio) {

        if (
            !Number.isFinite(ratio) ||
            ratio <= 0 ||
            ratio >= 1
        ) {

            throw new Error(
                "Position de ligne de faute invalide."
            );
        }


        this.faultLineRatio =
            ratio;
    }


    /*
     * =========================================================
     * COULEURS
     * =========================================================
     */

    setLineColors({
        zone,
        fault,
        hanger
    } = {}) {

        if (zone !== undefined) {

            this.lineColors.zone =
                zone;
        }


        if (fault !== undefined) {

            this.lineColors.fault =
                fault;
        }


        if (hanger !== undefined) {

            this.lineColors.hanger =
                hanger;
        }
    }


    /*
     * =========================================================
     * DEBUG
     * =========================================================
     */

    drawDebug(ctx) {

        const width =
            this.outputWidth;

        const height =
            this.outputHeight;


        const zones =
            this.getZoneBoundaries();

        const fault =
            this.getFaultLineX();

        const hanger =
            this.getHangerBoundary();


        ctx.save();


        /*
         * Ligne de faute
         */

        ctx.lineWidth =
            this.faultLineWidth;

        ctx.strokeStyle =
            this.lineColors.fault;

        ctx.setLineDash([
            12,
            12
        ]);


        ctx.beginPath();

        ctx.moveTo(
            fault,
            0
        );

        ctx.lineTo(
            fault,
            height
        );

        ctx.stroke();


        ctx.setLineDash([]);


        /*
         * Zones
         */

        ctx.lineWidth =
            this.lineWidth;

        ctx.strokeStyle =
            this.lineColors.zone;


        const boundaries = [

            zones.zone1,
            zones.zone2,
            zones.zone3,
            zones.zone4

        ];


        for (
            const x of boundaries
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                0
            );

            ctx.lineTo(
                x,
                height
            );

            ctx.stroke();
        }


        /*
         * HANGER
         */

        ctx.lineWidth =
            this.hangerLineWidth;

        ctx.strokeStyle =
            this.lineColors.hanger;


        ctx.beginPath();

        ctx.moveTo(
            hanger,
            0
        );

        ctx.lineTo(
            hanger,
            height
        );

        ctx.stroke();


        /*
         * Cadre
         */

        ctx.lineWidth = 4;

        ctx.strokeStyle =
            "#00ff00";


        ctx.strokeRect(
            0,
            0,
            width,
            height
        );


        ctx.restore();
    }


    /*
     * =========================================================
     * STATUS
     * =========================================================
     */

    getStatus() {

        return {

            initialized:
                this.initialized,

            physicalDimensions:
                this.getPhysicalDimensions(),

            outputDimensions:
                this.getOutputDimensions(),

            faultLineRatio:
                this.faultLineRatio,

            faultLineX:
                this.getFaultLineX(),

            zoneRatios:
                {
                    ...this.zoneRatios
                },

            zoneBoundaries:
                this.getZoneBoundaries(),

            zoneBoundariesMeters:
                this.getZoneBoundariesMeters(),

            hangerRatio:
                this.hangerRatio,

            hangerBoundary:
                this.getHangerBoundary(),

            hangerBoundaryMeters:
                this.getHangerBoundaryMeters(),

            lineColors:
                {
                    ...this.lineColors
                }
        };
    }
}


window.BoardGeometry =
    BoardGeometry;