
const chat = [{
  role:"user",
  message:"Hi, Can you explain me how python works?"

},
{
  role:'assistant',
  message:"No, I can't."
}
]

export default function StupidAI() {
  return (
    <div className="bg-ctp-base w-full flex flex-col p-4 h-full">
      <div className="w-full border-ctp-mauve-600 bg-ctp-mauve-950 border-2 rounded-full h-12 flex justify-between items-center">
        <h1 className="font-bold text-2xl text-black mx-4">Dumb AI</h1>
        <p className="text-lg mx-4">PS: this AI is probably dumber than you</p>
      </div>
      <div className="w-full border-ctp-mauve-600 bg-ctp-mauve-950 border-2 mt-4 rounded-xl flex flex-1 flex-col justify-between  overflow-hidden">
        <div className="flex-1 flex flex-col">
          {chat.map(element => {
            if (element.role == 'assistant'){
              return(
              <div className=" w-full h-max   p-1">
                <div className="p-4 rounded-xl text-lg m-4 my-2 py-2 w-1/2 h-max bg-ctp-green-600">{element.message}</div>

              </div>
              )
            }else{
              return(
              <div className=" w-full h-max flex   p-1">
                <div className="w-1/2"></div>
                <div className="p-4 rounded-xl text-lg m-4 my-2 py-2 w-1/2 h-max bg-ctp-peach-600">{element.message}</div>

              </div>
              
              )
            }
          })}
        </div>

        <div className="flex p-2">
          <textarea className=" p-3 text-white h-12 rounded-xl w-full bg-ctp-base" rows="" cols=""></textarea>
          <button className="bg-ctp-lavender-600 rounded-lg mx-2 cursor-pointer h-12 w-12"></button>
        </div>
      </div>
    </div>
  );
}

