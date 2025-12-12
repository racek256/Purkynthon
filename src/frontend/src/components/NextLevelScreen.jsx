import User from "../assets/user_icon.svg";
import Circle from "../assets/Circle.svg";
import { useState } from "react";
const leaderboard = [
  {
    name: "racek256",
    score: 265,
  },
  {
    name: "itsfimes",
    score: 245,
    active: true,
  },
  {
    name: "rakon",
    score: 324,
  },
  {
    name: "Martin40645",
    score: 234,
  },
];
//https://proxy.heexy.org/?q=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F88%2F14%2F9b%2F88149b0400750578f4d07d9bc3fb0fee.gif
//https://media.tenor.com/JYyzR_1h77MAAAAi/angry-emoji.gif
export default function NextLevel({ hide }) {
  const LeaderBoard = [...leaderboard]
    .sort((a, b) => a.score - b.score)
    .reverse();
  const [displayed, setDisplayed] = useState(false);

  return (
    <div className="w-screen top-0 left-0 h-screen fixed backdrop-blur-xs  z-999">
      <div className="absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 rounded-xl h-1/2 flex border border-white bg-bg">
        <div className="border border-white rounded-l-xl border-r w-11/16 h-full p-3">
          <div className="flex items-center">
            <img
              className="rounded-full bg-gray-500 m-3 h-24 w-24"
              src="https://proxy.heexy.org/?q=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F88%2F14%2F9b%2F88149b0400750578f4d07d9bc3fb0fee.gif"
            />
            <div className="text-white text-3xl">
              Příště trochu rychleji jo?{" "}
            </div>
          </div>
          <div className="flex-col">
            <div className="text-white text-3xl py-4 border-y border-white">
              Skóre: 465
            </div>
            <div className="text-white text-3xl py-4 ">Peníze: 543</div>
            <div className="text-white text-3xl py-4 border-y border-white">
              Čas: 5m 36s
            </div>
            <div className="relative w-max h-max  ">
              <img src={Circle} className="h-24 w-24 " />
              <div className="absolute top-1/2 left-1/2 -translate-y-1/2 text-6xl -translate-x-1/2 text-white">
                B
              </div>
            </div>
          </div>
        </div>
        <div className="border border-white border-l rounded-r-xl w-5/16  h-full flex-col p-2 overflow-y-hidden">
          <div className="h-7/8 overflow-y-auto">
            {LeaderBoard.map((e, i) => {
              return (
                <div key={i} className="my-3 relative ">
                  <div className="flex flex-col">
                    {e.active ? (
                      <div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color-active"></div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color-active"></div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color-active"></div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color-active"></div>
                      </div>
                    ) : (
                      <div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color"></div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color"></div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color"></div>
                        <div className="w-full h-3 p-0 rounded-xl bg-leaderboard-color"></div>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center mx-4 justify-between">
                    <div className="text-xl truncate">{`${i + 1}. ${e.name}`}</div>
                    <div className="text-xl">{e.score}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex-1">
            <button
              className="bg-button transition w-full h-12 rounded-md hover:bg-button-hover cursor-pointer text-xl"
              onClick={() => {
                hide();
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
