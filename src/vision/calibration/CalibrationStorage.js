class CalibrationStorage {

    constructor(fileName = "calibration.json") {

        this.fileName =
            fileName;

        this.storageKey =
            "AMZ_CALIBRATION_" +
            this.fileName;

        this.initialized =
            true;
    }


    /*
     * =====================================================
     * CONFIGURATION PAR DÉFAUT
     * =====================================================
     */

    getDefaultConfig() {

        return {

            version: 1,

            board: {

                lengthM: 1.20,

                widthM: 0.60
            },

            vision: {

                outputWidth: 1200,

                outputHeight: 600
            },

            geometry: {

                faultLineRatio: 0.20,

                zoneRatios: {

                    zone1: 0.40,

                    zone2: 0.60,

                    zone3: 0.80,

                    zone4: 0.90
                },

                hangerRatio: 0.95
            },

            lines: {

                zoneColor: "#ffffff",

                faultColor: "#000000",

                hangerColor: "#ffd700",

                zoneTolerance: 40,

                faultTolerance: 40,

                hangerTolerance: 40,

                zoneLineWidth: 3,

                faultLineWidth: 3,

                hangerLineWidth: 5
            }
        };
    }


    /*
     * =====================================================
     * SAUVEGARDE LOCALE
     * =====================================================
     */

    save(config) {

        if (!config) {

            throw new Error(
                "Configuration absente."
            );
        }


        const serialized =
            JSON.stringify(
                config,
                null,
                2
            );


        localStorage.setItem(
            this.storageKey,
            serialized
        );


        return true;
    }


    /*
     * =====================================================
     * CHARGEMENT
     * =====================================================
     */

    load() {

        const data =
            localStorage.getItem(
                this.storageKey
            );


        if (!data) {

            return null;
        }


        try {

            return JSON.parse(
                data
            );

        } catch (error) {

            console.error(
                "CalibrationStorage:",
                error
            );

            return null;
        }
    }


    /*
     * =====================================================
     * CHARGEMENT AVEC DEFAULT
     * =====================================================
     */

    loadOrDefault() {

        const config =
            this.load();


        if (config) {

            return config;
        }


        return this.getDefaultConfig();
    }


    /*
     * =====================================================
     * SUPPRESSION
     * =====================================================
     */

    clear() {

        localStorage.removeItem(
            this.storageKey
        );


        return true;
    }


    /*
     * =====================================================
     * EXISTENCE
     * =====================================================
     */

    exists() {

        return (
            localStorage.getItem(
                this.storageKey
            ) !== null
        );
    }


    /*
     * =====================================================
     * STATUS
     * =====================================================
     */

    getStatus() {

        return {

            initialized:
                this.initialized,

            storageKey:
                this.storageKey,

            exists:
                this.exists()
        };
    }
}


window.CalibrationStorage =
    CalibrationStorage;