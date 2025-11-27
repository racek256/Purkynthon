
export default function Navbar(){
	return(
		<div className="h-20  border-b  border-ctp-rosewater-900 w-full flex bg-ctp-base">
		<div className="h-full w-5/8 border-r border-ctp-rosewater-900">
		<h1 className="text-xl text-white p-2 pb-0">Vyřeš úlohu</h1>
		<p className="p-2 text-lg text-white">Tady bude úloha</p>
			
		</div>
		<div>
			<h1 className="text-white text-xl p-2 pb-0">Zaměstnavatel</h1>
			<div className="rounded-xl border-3 border-black h-6 w-64 m-2 overflow-hidden relative"><div className="w-1/2 bg-gradient-to-r from-ctp-green-600 to-ctp-red-900 h-full "></div>

		</div>
		</div>
			
		</div>
	)

}
