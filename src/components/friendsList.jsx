import "../styles/friendsList.css";
import { useEffect, useState } from "react";
import RequestCard from "./requestCard.jsx";
import FriendCard from "./friendCard.jsx";
import closeImg from "../assets/close.svg";



function FriendsList(
    {socket, friends, friendShips, friendRequests, sentReqs}) {

    const [requests, setRequests] = useState(
        getRequestCards(friendRequests, false)
    );
    const [sentRequests, setSentRequests] = useState(
        getRequestCards(sentReqs, true)
    );
    const [friendCards, setFriendCards] = useState(
        initFriendCards(friends, friendShips)
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

        socket.on("add-friend", function(friendInfo) {
            setFriendCards(cards => {
                const card = getFriendCard(
                    friendInfo.friend,
                    friendInfo.relationId
                );
                return [card, ...cards];
            });
        });

        socket.on("del-friend", function(relationId) {
            setFriendCards(cards => {
                const savedCards = [];
                for (let card of cards) {
                    if (card.props.relationId === relationId) {
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
            socket.off("add-friend");
            socket.off("del-friend");
        };
    }, [socket]);



    function getRequestCards(requests, sentRequest) {
        if (!Array.isArray(requests)) {
            const card =  <RequestCard
                request={requests}
                key={requests.id}
                deleteCb={delRequestCard}
                sent={sentRequest}
                addCb={AddFriendCard}
                statusCb={showStatus}
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
                    addCb={AddFriendCard}
                    statusCb={showStatus}
                />
            );
        }
        return cards;
    };


    function initFriendCards(friends=null, friendShips=null) {
        const cards = [];
        if (friends) {
            for (let relation of friends) {
                cards.push(
                    <FriendCard
                       relationId={relation.id} 
                       friend={relation.friend}
                       key={relation.id}
                       deleteCb={delFriendCard}
                       statusCb={showStatus}
                    />
                );
            }
        }
        if (friendShips) {
            for (let relation of friendShips) {
                cards.push(
                    <FriendCard
                       relationId={relation.id} 
                       friend={relation.user}
                       key={relation.id}
                       deleteCb={delFriendCard}
                       statusCb={showStatus}
                    />
                );
            }
        }
        return cards;
    };

    
    function getFriendCard(friend, relationId) {
        const card = <FriendCard
            relationId={relationId}
            friend={friend}
            key={relationId}
            deleteCb={delFriendCard}
            statusCb={showStatus}
        />
        return card;
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


    function delFriendCard(relationId, roomId) {
        setFriendCards(cards => {
            const savedCards = [];
            for (let card of cards) {
                if (card.props.relationId === relationId) {
                    continue;
                }
                savedCards.push(card);
            }
            return savedCards;
        });

        socket.emit("del-friend", relationId, roomId);
    };


    function AddFriendCard(friendLink, roomId) {
        setFriendCards(cards => {
            const card = getFriendCard(
                friendLink.friend,
                friendLink.id
            );
            return [card, ...cards];
        });

        socket.emit(
            "add-friend", 
            {
                relationId: friendLink.id,
                friend: friendLink.user
            },
            roomId
        );
    };


    function showStatus(msg) {
        const statusModal = document.querySelector(
            ".status-modal-2"
        );
        const para = statusModal.firstChild;
        para.textContent = msg;
        statusModal.classList.remove("hidden");
    };


    function hideStatus() {
        const statusModal = document.querySelector(
            ".status-modal-2"
        );
        statusModal.classList.add("hidden");
    };

    
    return (
    <>
        <div className="status-modal-2 hidden">
            <p className="status-msg">Loading messages...</p>
            <button onClick={hideStatus}>
                <img src={closeImg} alt="" />
            </button>
        </div>
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
        <p className="friends-para">Friends</p>
        <div className="friends-list">
            {friendCards}
        </div>
    </>
    );
};



export default FriendsList;