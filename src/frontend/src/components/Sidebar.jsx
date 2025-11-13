import {useState} from 'react'
export default function Sidebar(Props){
  const [sidebarWidth, setSidebarWidth] = useState(false);
  console.log(Props)




  return(
    <div  className={`flex absolute relative  max-w-124 ${sidebarWidth ? "w-6" : "w-3/7"}  transition-all  bg-white rounded-r-xl overflow-hidden `}>
        <div className={`h-screen bg-stone-300 ${sidebarWidth ? "w-0" : "w-full"} transition-all  `}>
            <div className={`flex-col p-4 w-full h-screen ${sidebarWidth ? "opacity-0 pointer-events-none cursor-normal" : "opacity-100"} transition-all`}>
              {Props.nodes.map((element,i) => {
               return(<div key={i} onDragStart={e=>{e.dataTransfer.setData("text/plain", element.label) }} className="w-full h-12 my-2 rounded-xl cursor-pointer flex  items-center bg-stone-500" draggable="true" onClick={()=>Props.addNode(element.label)}>
              <div className="ps-3 text-2xl text-black select-none ">
               {element.label}
              </div>

            </div>)
               })}
            </div>
        </div>
        <div className=" h-24 w-6 rounded-r-xl bg-slate-300 m-auto cursor-pointer" onClick={()=>{

          if (sidebarWidth) {
            setSidebarWidth(false)
          }else{
            setSidebarWidth(true)
          }
        }}></div>

      </div>
  )
}
