
export default function Sidebar({selectTheme}){
	return (
		<div className="w-5/32 min-w-42 h-dvh  border-r border-ctp-rosewater-900 bg-ctp-mantle flex flex-col justify-between"> 
			<div className=""></div>
			<div className="bg-ctp-lavender-900 h-24 w-full rounded-t-lg p-2">
			<div className="flex">
				<p className="text-xl">Uživatel: </p>
				<span className="text-bold text-xl truncate"> František Pátek</span>
			</div>

				<div className="flex">
				<p className="w-full ">Lekce1</p>
				<select className="bg-ctp-mauve-300 shadow-xl border border-ctp-mauve-900 p-2 rounded-lg" onChange={e=>{console.log("setting theme: " + e.target.value); selectTheme(e.target.value)}}>
					<option>mocha</option>
					<option>macchiato</option>
					<option>frappe</option>
					<option>latte</option>
				</select>
				</div>
			</div>
		</div>
	)

}
