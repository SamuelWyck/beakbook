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


    async checkAuthStatus() {
        const url = `${this.#apiDomain}/auth/status`;
        const options = {
            mode: "cors",
            method: "GET",
            credentials: "include"
        };

        const response = await this.#makeApiCall(url, options);
        return response;
    };


    async getUserData() {
        const url = `${this.#apiDomain}/user`;
        const options = {
            mode: "cors",
            method: "GET",
            credentials: "include"
        };

        const response = await this.#makeApiCall(url, options);
        return response;
    };


    async getChatMessages(roomId, pageNum) {
        const url = `${this.#apiDomain}/messages/${roomId}?pageNum=${pageNum}`;
        const options = {
            mode: "cors",
            method: "GET",
            credentials: "include"
        };

        const response = await this.#makeApiCall(url, options);
        return response;
    };


    async editMessage(reqBody, messageId) {
        const url = `${this.#apiDomain}/messages/edit/${messageId}`;
        const options = {
            mode: "cors",
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: reqBody,
            credentials: "include"
        };

        const response = await this.#makeApiCall(url, options);
        return response;
    };


    async deleteMessage(messageId) {
        const url = `${this.#apiDomain}/messages/delete/${messageId}`;
        const options = {
            mode: "cors",
            method: "DELETE",
            credentials: "include"
        };

        const response = this.#makeApiCall(url, options);
        return response;
    };


    async sendFriendRequest(reqBody) {
        const url = `${this.#apiDomain}/friends/request`;
        const options = {
            mode: "cors",
            method: "POST",
            credentials: "include",
            headers: {
                "content-type": "application/json"
            },
            body: reqBody
        };

        const response = await this.#makeApiCall(url, options);
        return response;
    };


    async deleteFriendRequest(requestId) {
        const endPoint = `/delete/${requestId}`;
        const url = `${this.#apiDomain}/friends/request${endPoint}`;
        const options = {
            mode: "cors",
            method: "DELETE",
            credentials: "include"
        };

        const response = await this.#makeApiCall(url, options);
        return response;
    };


    getSocketUrl() {
        return this.#apiDomain;
    };
};



export default new ApiManager();