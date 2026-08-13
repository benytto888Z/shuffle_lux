class BoardZones {

    constructor() {

        // Dimensions physiques réelles
        this.width = 1200;
        this.height = 600;


        /*
         * Zone de tir
         *
         * Les pucks sont lancés
         * depuis X = 0.
         */

        this.shootingZoneEnd = 100;


        /*
         * Début du scoring
         */

        this.scoringStart =
            this.shootingZoneEnd;


        /*
         * Longueur disponible
         * pour les 4 zones
         */

        this.scoringLength =
            this.width -
            this.scoringStart;


        /*
         * 1100 / 4 = 275 mm
         */

        this.zoneLength =
            this.scoringLength / 4;


        /*
         * ZONES DE SCORE
         *
         * Zone 1 : 100 → 375
         * Zone 2 : 375 → 650
         * Zone 3 : 650 → 925
         * Zone 4 : 925 → 1200
         */

        this.zones = {

            zone1: {

                score: 1,

                xMin:
                    100,

                xMax:
                    375
            },


            zone2: {

                score: 2,

                xMin:
                    375,

                xMax:
                    650
            },


            zone3: {

                score: 3,

                xMin:
                    650,

                xMax:
                    925
            },


            zone4: {

                score: 4,

                xMin:
                    925,

                xMax:
                    1200
            }
        };
    }


    getZone(number) {

        return this.zones[
            `zone${number}`
        ] || null;
    }


    getAllZones() {

        return {
            ...this.zones
        };
    }


    getZoneLength() {

        return this.zoneLength;
    }


    getStatus() {

        return {

            boardWidth:
                this.width,

            boardHeight:
                this.height,

            shootingZoneEnd:
                this.shootingZoneEnd,

            scoringStart:
                this.scoringStart,

            scoringLength:
                this.scoringLength,

            zoneLength:
                this.zoneLength,

            zones:
                this.getAllZones()
        };
    }
}


window.BoardZones =
    BoardZones;