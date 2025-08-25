class ApiManager {
    #apiDomain = "http://localhost:3000";


    async #makeApiCall(url, options) {
        try {
            const res = await fetch(url, options);
            const jsonRes = await res.json();
            return jsonRes;
        } catch {
            return {
                errors: [{msg: "Unable to connect to server"}]
            };
        }
    };


    async #signupOrLogin(reqBody, signup) {
        const endPoint = (signup) ? "signup" : "login";
        const url = `${this.#apiDomain}/auth/${endPoint}`;
        const options = {
            headers: {
                "content-type": "application/json"
            },
            mode: "cors",
            method: "POST",
            body: reqBody,
            credentials: "include"
        };

        const reponse = await this.#makeApiCall(url, options);
        return reponse;
    }


    async signupUser(reqBody) {
        const res = await this.#signupOrLogin(reqBody, true);
        return res;
    };


    async loginUser(reqBody) {
        const res = await this.#signupOrLogin(reqBody, false);
        return res;
    };


    async logoutUser() {
        const url = `${this.#apiDomain}/auth/logout`;
        const options = {
            mode: "cors",
            method: "POST",
            credentials: "include"
        };

        const reponse = await this.#makeApiCall(url, options);
        return reponse;
    };
};



export default new ApiManager();