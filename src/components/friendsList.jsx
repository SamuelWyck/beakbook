import "../styles/friendsList.css";
import { useEffect, useState } from "react";
import apiManager from "../utils/apiManager.js";
import RequestCard from "./requestCard.jsx";



function FriendsList(
    {socket, friends, friendRequests, sentReqs}) {

    const [requests, setRequests] = useState(
        getRequestCards(friendRequests, false)
    );
    const [sentRequests, setSentRequests] = useState(
        getRequestCards(sentReqs, true)
    );


    useEffect(function() {
        socket.on("friend-request", function(request) {
            const card = getRequestCards(request, false);
            setRequests(cards => {
                return [card, ...cards];
            });
        });

        socket.on("sent-request", function(request) {
            const card = getRequestCards(request, true);
            setSentRequests(cards => {
                return [card, ...cards];
            });
        });

        socket.on("del-request", function(request) {
            setRequests(cards => {
                const savedCards = [];
                for (let card of cards) {
                    if (card.props.request.id === request.id) {
                        continue;
                    }
                    savedCards.push(card);
                }
                return savedCards;
            });
        });

        socket.on("del-sent-request", function(request) {
            setSentRequests(cards => {
                const savedCards = [];
                for (let card of cards) {
                    if (card.props.request.id === request.id) {
                        continue;
                    }
                    savedCards.push(card);
                }
                return savedCards;
            });
        });

        return function() {
            socket.off("friend-request");
            socket.off("sent-request");
            socket.off("del-request");
            socket.off("del-sent-request");
        };
    }, [socket]);



    function getRequestCards(requests, sentRequest) {
        if (!Array.isArray(requests)) {
            const card =  <RequestCard
                request={requests}
                key={requests.id}
                deleteCb={delRequestCard}
                sent={sentRequest}
            />
            return card;
        }

        const cards = [];
        for (let request of requests) {
            cards.push(
                <RequestCard 
                    request={request}
                    key={request.id}
                    deleteCb={delRequestCard}
                    sent={sentRequest}
                />
            );
        }
        return cards;
    };


    function delRequestCard(request, sent) {
        let func = setRequests;
        if (sent) {
            func = setSentRequests;
        }

        func(cards => {
            const savedCards = [];
            for (let card of cards) {
                if (card.props.request.id === request.id) {
                    continue;
                }
                savedCards.push(card);
            }
            return savedCards;
        });

        if (sent) {
            socket.emit(
                "del-request", 
                request, 
                request.receivingUserId
            );
        } else {
            socket.emit(
                "del-sent-request",
                request,
                request.requestingUserId
            );
        }
    };

    
    return (
    <>
        {sentRequests.length <= 0 ||
        <>
        <p className="sent-para">Sent Requests</p>
        <div className="sent-requests">
            {sentRequests}
        </div>
        </>
        }
        {requests.length <= 0 ||
        <>
        <p className="incoming-para">Incoming requests</p>
        <div className="incoming-requests">
            {requests}
        </div>
        </>
        }
        <div className="friends-list">

        </div>
    </>
    );
};



export default FriendsList;