
export default function MeasurementLegend() {
  const legends = [
    { color: "bg-yellow-500", label: "Amarelo - Calibração" },
    { color: "bg-red-500", label: "Vermelho - Comprimento" },
    { color: "bg-blue-500", label: "Azul - Largura" },
    { color: "bg-green-500", label: "Verde - Diagonal D" },
    { color: "bg-purple-500", label: "Roxo - Diagonal E" }
  ];

  return (
    <div className="flex flex-col gap-2 items-start mt-4 text-sm">
      {legends.map((legend, index) => (
        <div key={index} className="flex items-center">
          <div className={`w-3 h-3 ${legend.color} rounded-full mr-2`} />
          <p>{legend.label}</p>
        </div>
      ))}
    </div>
  );
}
