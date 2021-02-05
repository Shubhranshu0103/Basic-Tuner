class Yin {

    constructor(bSize, thresh) {

        this.samplingRate = 48000;
        this.bufferSize = bSize;
        this.halfBufferSize = Math.floor(bSize / 2);
        this.buffer = new Array(this.halfBufferSize).fill(0);
        this.probability = 0;
        this.threshold = thresh;
    }

    _difference(sig) {

        let tau;
        for (tau = 0; tau < this.halfBufferSize; tau++) {

            for (let i = 0; i < this.halfBufferSize; i++) {

                let delta = sig[i] - sig[i + tau];
                this.buffer[tau] += delta * delta;
            }
        }
    }

    _cumulativeNormalizedMeanDifference() {

        this.buffer[0] = 1;
        let curSum = 0;

        for (let tau = 1; tau < this.halfBufferSize; tau++) {
            curSum += this.buffer[tau];
            this.buffer[tau] *= tau / curSum;
        }
    }

    _absoluteThreshold() {

        let tau;
        for (tau = 2; tau < this.halfBufferSize; tau++) {

            if (this.buffer[tau] < this.threshold) {

                while (tau + 1 < this.halfBufferSize && this.buffer[tau] > this.buffer[tau + 1])
                    tau++;

                this.probability = 1 - this.buffer[tau];

                break;

            }
        }

        if (tau == this.halfBufferSize || this.buffer[tau] >= this.threshold) {

            tau - 1;
            this.probability = 0;
        }

        return tau;
    }

    _parabolicInterpolation(approxTau) {

        let x0, x2;
        let improvedTau;

        if (approxTau < 1)
            x0 = approxTau;
        else
            x0 = approxTau - 1;

        if (approxTau + 1 < this.halfBufferSize)
            x2 = approxTau + 1;
        else
            x2 = approxTau;


        if (x0 == approxTau) {

            if (this.buffer[approxTau] < this.buffer[x2])
                improvedTau = approxTau;
            else
                improvedTau = x2;
        }

        else if (x2 == approxTau) {

            if (this.buffer[approxTau] < this.buffer[x0])
                improvedTau = approxTau;

            else
                improvedTau = x0;
        }

        else {

            let a, b, c;

            a = this.buffer[x0];
            b = this.buffer[approxTau];
            c = this.buffer[x2];

            improvedTau = approxTau + (c - a) / (2 * (2 * b - c - a));
        }

        return improvedTau;

    }


    getPitch(sig) {

        let approxTau = -1;
        let improvedTau = -1;
        let pitch = -1;

        this._difference(sig);
        this._cumulativeNormalizedMeanDifference();
        approxTau = this._absoluteThreshold();

        if (approxTau != -1) {
            improvedTau = this._parabolicInterpolation(approxTau);

            pitch = this.samplingRate / improvedTau;
        }


        return pitch;
    }

}