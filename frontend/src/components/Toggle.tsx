export default function Toggle({ checked, onChange, disabled }: { checked: boolean; disabled?: boolean; onChange: (v:boolean)=>void }) {
  return (
    <button onClick={() => !disabled && onChange(!checked)} className={`w-12 h-7 rounded-full ${checked ? "bg-green-500" : "bg-gray-300"} relative transition`}>
      <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`}></span>
    </button>
  );
}
