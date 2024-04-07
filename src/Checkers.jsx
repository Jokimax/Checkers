import { useState } from 'react'
import './style.css'
import Queen from "../public/queen.svg"
import { getMoves, getPeasantMoves, getKingMoves } from 'checkers-lib/engine'
import { getBestMove } from 'checkers-lib/ai'

var singlePlayer = true
var forcedCaptures = true
var canCaptureBackwards = true
var flyingKing = true
var maxCaptures = false
var hasToCapture = false
var depth = 6

let playerTurn = true
let whiteTurn = true

function Checkers() {
    const [depthDisplay, setDepthDisplay] = useState(depth)
    const [gameMessage, setMessage] = useState()
    const [board, setBoard] = useState([
        ["*", "b", "*", "b", "*", "b", "*", "b"],
        ["b", "*", "b", "*", "b", "*", "b", "*"],
        ["*", "b", "*", "b", "*", "b", "*", "b"],
        ["*", "*", "*", "*", "*", "*", "*", "*"],
        ["*", "*", "*", "*", "*", "*", "*", "*"],
        ["w", "*", "w", "*", "w", "*", "w", "*"],
        ["*", "w", "*", "w", "*", "w", "*", "w"],
        ["w", "*", "w", "*", "w", "*", "w", "*"]
    ])
    const [moves, setMoves] = useState([])

    function getSquareColor(x, y) {
        for (let move of moves) {
            let lastElementIndex = move.length - 1
            if(move[lastElementIndex].x === x && move[lastElementIndex].y === y) {
                return "red"
            }
            for(let i = 0; i < lastElementIndex; i++){
                if(move[i].x === x && move[i].y === y) return "orange"
            }
        }
        if(y%2 === 0 && x%2 === 0 || y%2 === 1 && x%2 === 1) return "#e1d9d1"
        return "brown"
    }

    function getPieceColor(piece) {
        if(piece === "w" || piece === "W") return "white"
        return "#4f1f28"
    }

    function pieceIsQueen(piece) {
        if(piece === "W" || piece === "B") return true
        return false
    }

    function newGame() {
        const gameBoard = [
            ["*", "b", "*", "b", "*", "b", "*", "b"],
            ["b", "*", "b", "*", "b", "*", "b", "*"],
            ["*", "b", "*", "b", "*", "b", "*", "b"],
            ["*", "*", "*", "*", "*", "*", "*", "*"],
            ["*", "*", "*", "*", "*", "*", "*", "*"],
            ["w", "*", "w", "*", "w", "*", "w", "*"],
            ["*", "w", "*", "w", "*", "w", "*", "w"],
            ["w", "*", "w", "*", "w", "*", "w", "*"]
        ]
        setMoves([])
        setMessage()
        forcedCaptures = document.getElementById("forcedCaptures").checked
        canCaptureBackwards = document.getElementById("canCaptureBackwards").checked
        flyingKing = document.getElementById("flyingKing").checked
        maxCaptures = document.getElementById("maxCaptures").checked
        singlePlayer = document.getElementById("singlePlayer").checked
        playerTurn = (!singlePlayer || document.getElementById("playerWhite").checked)
        depth = document.getElementById("depth").value
        whiteTurn = true
        if(singlePlayer && !playerTurn) {
            const move = getBestMove(gameBoard, "w", forcedCaptures, canCaptureBackwards, flyingKing, maxCaptures, depth);
            makeMove(gameBoard, move);
        }
        else {
            setBoard(gameBoard)
        }
    }

    function newTurn() {
        setMoves([])
        if(singlePlayer) playerTurn = !playerTurn
        whiteTurn = !whiteTurn
        if(playerTurn) playerTurnProcess()
        else aiTurnProcess()
    }

    function playerTurnProcess() {
        if(whiteTurn) {
            let moves = getMoves(board, "w", forcedCaptures, canCaptureBackwards, flyingKing, maxCaptures)
            if(moves.moves.length === 0){
                setMessage("Black Wins!")
                return 
            }
            hasToCapture = moves.hasToCapture
        }
        else {
            let moves = getMoves(board, "b", forcedCaptures, canCaptureBackwards, flyingKing, maxCaptures)
            if(moves.moves.length === 0){
                setMessage("White Wins!")
                return 
            }
            hasToCapture = moves.hasToCapture
        }
    }

    function aiTurnProcess() {
        let move = []
        if(whiteTurn) move = getBestMove(board, "w", forcedCaptures, canCaptureBackwards, flyingKing, maxCaptures, depth)
        else move = getBestMove(board, "b", forcedCaptures, canCaptureBackwards, flyingKing, maxCaptures, depth)
        if(move === null) {
            if(whiteTurn) setMessage("Black Wins!")
            else setMessage("White Wins!")
            return
        }
        makeMove([...board], move)
    }

    function getSquareInfo(x, y) {
        if(!playerTurn) return
        if(board[y][x] !== "*") {
            getPieceMoves(x, y)
            return
        }
        tryMoving(x, y)
        setMoves([])
    }

    function tryMoving(x, y) {
        for (let move of moves) {
            let lastElementIndex = move.length - 1
            if(move[lastElementIndex].x === x && move[lastElementIndex].y === y) {
                makeMove([...board], move)
                return
            }
        }
    }

    function getPieceMoves(x, y) {
        if(board[y][x] === "B") {
            if(whiteTurn) {
                setMoves([])
                return
            }
            setMoves(getKingMoves(board, x, y, "b", hasToCapture, forcedCaptures, flyingKing).moves)
        }
        else if(board[y][x] === "W") {
            if(!whiteTurn) {
                setMoves([])
                return
            }
            setMoves(getKingMoves(board, x, y, "w", hasToCapture, forcedCaptures, flyingKing).moves)
        }
        else if(board[y][x] === "b") {
            if(whiteTurn) {
                setMoves([])
                return
            }
            setMoves(getPeasantMoves(board, x, y, "b", hasToCapture, forcedCaptures, canCaptureBackwards).moves)
        }
        else {
            if(!whiteTurn) {
                setMoves([])
                return
            }
            setMoves(getPeasantMoves(board, x, y, "w", hasToCapture, forcedCaptures, canCaptureBackwards).moves)
        }
    }

    function makeMove(updatedBoard, move) {
        let lastElementIndex = move.length - 1
        if (move[lastElementIndex]["y"] === 7 && move[0]["originalPiece"] === "b") {
            updatedBoard[move[lastElementIndex]["y"]][move[lastElementIndex]["x"]] = "B"
        } else if (move[lastElementIndex]["y"] === 0 && move[0]["originalPiece"] === "w") {
            updatedBoard[move[lastElementIndex]["y"]][move[lastElementIndex]["x"]] = "W"
        } else {
            updatedBoard[move[lastElementIndex]["y"]][move[lastElementIndex]["x"]] = move[0]["originalPiece"]
        }
        for (let i = 0; i < lastElementIndex; i++) {
            updatedBoard[move[i]["y"]][move[i]["x"]] = "*"
        }
        setBoard(updatedBoard)
        setTimeout(() => {
            newTurn()
        }, 0)
    }

    return (
        <>
            <div className='board'>
                <div className='gameMessage'>{gameMessage}</div>
                {board.map((row, y) => (
                    <div key={y} className='row'>{
                    row.map((square, x) => (
                        <div key={x} onClick={() => getSquareInfo(x, y)} style={{background: getSquareColor(x, y)}} className="square">
                            {board[y][x] !== "*" && 
                                <div style={{background: getPieceColor(board[y][x])}} className="piece">
                                    <div style={{background: getPieceColor(board[y][x])}} className="piece"></div>
                                        {pieceIsQueen(board[y][x]) && <img className='queen' src={Queen}></img>}
                                </div>
                            }
                        </div>
                    ))}
                    </div>
                ))}
            </div>
            <div className='gameSettings'>
                <label htmlFor='forcedCaptures'>Forced Captures </label>
                <input className='setting' defaultChecked={forcedCaptures} type='checkbox' id='forcedCaptures'></input><br></br>
                <label htmlFor='canCaptureBackwards'>Can Capture Backwards </label>
                <input className='setting' defaultChecked={canCaptureBackwards} type='checkbox' id='canCaptureBackwards'></input><br></br>
                <label htmlFor='flyingKing'>Flying King </label>
                <input className='setting' defaultChecked={flyingKing} type='checkbox' id='flyingKing'></input><br></br>
                <label htmlFor='maxCaptures'>Max Captures </label>
                <input className='setting' defaultChecked={maxCaptures} type='checkbox' id='maxCaptures'></input><br></br>
                <label htmlFor='singlePlayer'>Single Player </label>
                <input className='setting' defaultChecked={singlePlayer} type='checkbox' id='singlePlayer'></input><br></br>
                <label htmlFor='singlePlayer'>Player Starts as White </label>
                <input className='setting' defaultChecked={playerTurn} type='checkbox' id='playerWhite'></input><br></br>
                <label htmlFor='singlePlayer'>Depth {depthDisplay} </label>
                <input type="range" id="depth" min="1" max="12" defaultValue={depth} onChange={(event) => setDepthDisplay(event.target.value)}></input><br></br>
                <button className='newGameButton' onClick={() => newGame()}>New Game</button>
            </div>
        </>
    )
}

export default Checkers
