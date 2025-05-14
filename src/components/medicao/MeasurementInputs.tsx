
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MeasurementInputsProps {
  comprimento: number | null;
  largura: number | null;
  diagonalDireita: number | null;
  diagonalEsquerda: number | null;
  perimetroCefalico: number | null;
  onInputChange: (field: string, value: number | null) => void;
}

const MeasurementInputs: React.FC<MeasurementInputsProps> = ({
  comprimento,
  largura,
  diagonalDireita,
  diagonalEsquerda,
  perimetroCefalico,
  onInputChange
}) => {
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onInputChange(field, isNaN(value) ? null : value);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="comprimento">Comprimento (cm)</Label>
        <Input
          type="number"
          id="comprimento"
          value={comprimento !== null ? comprimento.toString() : ''}
          onChange={handleChange('comprimento')}
          placeholder="Comprimento"
        />
      </div>
      <div>
        <Label htmlFor="largura">Largura (cm)</Label>
        <Input
          type="number"
          id="largura"
          value={largura !== null ? largura.toString() : ''}
          onChange={handleChange('largura')}
          placeholder="Largura"
        />
      </div>
      <div>
        <Label htmlFor="diagonalDireita">Diagonal Direita (cm)</Label>
        <Input
          type="number"
          id="diagonalDireita"
          value={diagonalDireita !== null ? diagonalDireita.toString() : ''}
          onChange={handleChange('diagonalDireita')}
          placeholder="Diagonal Direita"
        />
      </div>
      <div>
        <Label htmlFor="diagonalEsquerda">Diagonal Esquerda (cm)</Label>
        <Input
          type="number"
          id="diagonalEsquerda"
          value={diagonalEsquerda !== null ? diagonalEsquerda.toString() : ''}
          onChange={handleChange('diagonalEsquerda')}
          placeholder="Diagonal Esquerda"
        />
      </div>
      <div>
        <Label htmlFor="perimetroCefalico">Perímetro Cefálico (cm)</Label>
        <Input
          type="number"
          id="perimetroCefalico"
          value={perimetroCefalico !== null ? perimetroCefalico.toString() : ''}
          onChange={handleChange('perimetroCefalico')}
          placeholder="Perímetro Cefálico"
        />
      </div>
    </div>
  );
};

export default MeasurementInputs;
