class GameRoundManager {

    constructor(config = {}) {

        this.gameDuration =
            config.gameDuration ?? 10000;

        this.stabilizationDuration =
            config.stabilizationDuration ?? 3000;

        this.timer = null;

        this.stabilizationTimer = null;

        this.running = false;

        this.stabilizing = false;

        this.analyzing = false;

        this.remainingTime = 0;

        this.onGameStart =
            config.onGameStart ?? null;

        this.onGameFinish =
            config.onGameFinish ?? null;

        this.onAnalysis =
            config.onAnalysis ?? null;

        this.onTick =
            config.onTick ?? null;
    }


    start() {

        if (this.running) {

            console.warn(
                "GameRoundManager : manche déjà en cours."
            );

            return;
        }


        this.clearTimers();


        this.running = true;

        this.stabilizing = false;

        this.analyzing = false;

        this.remainingTime =
            this.gameDuration;


        console.log(
            "🎮 MANCHE DÉMARRÉE"
        );


        if (
            typeof this.onGameStart ===
            "function"
        ) {

            this.onGameStart();
        }


        this.tick();


        this.timer =
            setInterval(
                () => {

                    this.remainingTime -= 1000;

                    if (
                        this.remainingTime <= 0
                    ) {

                        this.remainingTime = 0;

                        this.tick();

                        this.finish();

                        return;
                    }


                    this.tick();

                },
                1000
            );
    }


    tick() {

        if (
            typeof this.onTick ===
            "function"
        ) {

            this.onTick(
                this.remainingTime
            );
        }
    }


finish() {

    if (!this.running) {
        return;
    }

    if (this.timer) {

        clearInterval(this.timer);

        this.timer = null;
    }

    this.stabilizing = true;

    console.log(
        "⏱️ TEMPS DE JEU TERMINÉ"
    );

    console.log(
        "⏳ STABILISATION : 3 secondes"
    );

    if (
        typeof this.onGameFinish ===
        "function"
    ) {

        this.onGameFinish();
    }

    this.stabilizationTimer =
        setTimeout(
            () => {

                this.analyze();

            },
            this.stabilizationDuration
        );
}


    analyze() {

        if (this.analyzing) {

            return;
        }


        this.analyzing = true;

        this.stabilizing = false;


        console.log(
            "📸 CAPTURE FINALE — ANALYSE"
        );


        if (
            typeof this.onAnalysis ===
            "function"
        ) {

            this.onAnalysis();
        }


        this.running = false;

        this.analyzing = false;
    }


    cancel() {

        this.clearTimers();


        this.running = false;

        this.stabilizing = false;

        this.analyzing = false;

        this.remainingTime = 0;


        console.log(
            "🛑 MANCHE ANNULÉE"
        );


        this.tick();
    }


    clearTimers() {

        if (this.timer) {

            clearInterval(
                this.timer
            );

            this.timer = null;
        }


        if (
            this.stabilizationTimer
        ) {

            clearTimeout(
                this.stabilizationTimer
            );

            this.stabilizationTimer = null;
        }
    }


    getStatus() {

        return {

            running:
                this.running,

            stabilizing:
                this.stabilizing,

            analyzing:
                this.analyzing,

            remainingTime:
                this.remainingTime
        };
    }
}


window.GameRoundManager =
    GameRoundManager;