
import html2pdf from "html2pdf.js";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";

interface MedicaoExportable {
  data: string;
  indice_craniano: number;
  cvai: number;
  perimetro_cefalico?: number;
  comprimento_maximo?: number;
  largura_maxima?: number;
  diagonal_direita?: number;
  diagonal_esquerda?: number;
  diagonal_d?: number;
  diagonal_e?: number;
  diferenca_diagonais?: number;
}

interface PacienteExportable {
  nome: string;
  data_nascimento: string;
}

export class MedicaoExportUtils {
  static exportToCSV(medicoes: MedicaoExportable[], paciente: PacienteExportable): void {
    if (!medicoes.length) return;

    const headers = [
      "Data", "Idade", "Perímetro Cefálico (mm)", "Comprimento Máximo (mm)", 
      "Largura Máxima (mm)", "Diagonal Direita (mm)", "Diagonal Esquerda (mm)", 
      "Diferença Diagonais (mm)", "Índice Craniano (%)", "CVAI (%)", 
      "Tipo de Assimetria", "Nível de Severidade"
    ];

    const rows = medicoes.map(medicao => {
      const { asymmetryType, severityLevel } = getCranialStatus(medicao.indice_craniano, medicao.cvai);
      const dataFormatada = new Date(medicao.data).toLocaleDateString('pt-BR');
      const idade = formatAge(paciente.data_nascimento, medicao.data);
      
      return [
        dataFormatada,
        idade,
        medicao.perimetro_cefalico || '',
        medicao.comprimento_maximo || '',
        medicao.largura_maxima || '',
        medicao.diagonal_direita || medicao.diagonal_d || '',
        medicao.diagonal_esquerda || medicao.diagonal_e || '',
        medicao.diferenca_diagonais || '',
        medicao.indice_craniano.toFixed(1),
        medicao.cvai.toFixed(1),
        this.translateAsymmetryType(asymmetryType),
        this.translateSeverityLevel(severityLevel)
      ];
    });

    // Criar o conteúdo CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escapa valores com vírgulas
        if (cell && typeof cell === 'string' && cell.includes(',')) {
          return `"${cell}"`;
        }
        return cell;
      }).join(','))
    ].join('\n');

    // Criar um blob com o conteúdo CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Criar um link para download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historico_medicoes_${paciente.nome.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    
    // Disparar o clique para iniciar o download
    link.click();
    
    // Limpar
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async exportToPDF(medicoes: MedicaoExportable[], paciente: PacienteExportable): Promise<void> {
    if (!medicoes.length) return;

    // Criar HTML para o PDF
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    // Estilo para o PDF
    const style = `
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        h1, h2 {
          color: #2c3e50;
          margin-bottom: 10px;
        }
        .header {
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .paciente-info {
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
      </style>
    `;
    
    // Cabeçalho
    const header = `
      <div class="header">
        <h1>Histórico de Medições Cranianas</h1>
        <p>Data de geração: ${dataAtual}</p>
      </div>
    `;
    
    // Info do paciente
    const pacienteInfo = `
      <div class="paciente-info">
        <h2>Paciente: ${paciente.nome}</h2>
        <p>Data de Nascimento: ${new Date(paciente.data_nascimento).toLocaleDateString('pt-BR')}</p>
      </div>
    `;
    
    // Tabela de medições
    let tableRows = '';
    medicoes.forEach(medicao => {
      const { asymmetryType, severityLevel } = getCranialStatus(medicao.indice_craniano, medicao.cvai);
      const dataFormatada = new Date(medicao.data).toLocaleDateString('pt-BR');
      const idade = formatAge(paciente.data_nascimento, medicao.data);
      const perimetro = medicao.perimetro_cefalico ? `${medicao.perimetro_cefalico} mm` : '-';
      
      tableRows += `
        <tr>
          <td>${dataFormatada}</td>
          <td>${idade}</td>
          <td>${perimetro}</td>
          <td>${medicao.indice_craniano.toFixed(1)}%</td>
          <td>${medicao.cvai.toFixed(1)}%</td>
          <td>${this.translateAsymmetryType(asymmetryType)}</td>
          <td>${this.translateSeverityLevel(severityLevel)}</td>
        </tr>
      `;
    });
    
    const table = `
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Idade</th>
            <th>Perímetro</th>
            <th>Índice Craniano</th>
            <th>CVAI</th>
            <th>Tipo de Assimetria</th>
            <th>Severidade</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
    
    // Rodapé
    const footer = `
      <div class="footer">
        <p>Documento gerado pelo Cranium Care Clinic.</p>
      </div>
    `;
    
    // Juntando tudo
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Histórico de Medições - ${paciente.nome}</title>
        ${style}
      </head>
      <body>
        ${header}
        ${pacienteInfo}
        ${table}
        ${footer}
      </body>
      </html>
    `;
    
    // Configurações do PDF
    const options = {
      margin: [10, 10],
      filename: `historico_medicoes_${paciente.nome.replace(/\s+/g, '_').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Gerar o PDF
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    document.body.appendChild(element);
    
    await html2pdf().from(element).set(options).save();
    document.body.removeChild(element);
  }
  
  // Métodos auxiliares de tradução
  private static translateAsymmetryType(type: string): string {
    const translations: Record<string, string> = {
      "normal": "Normal",
      "plagiocephaly": "Plagiocefalia",
      "brachycephaly": "Braquicefalia",
      "combined": "Combinada"
    };
    return translations[type] || type;
  }
  
  private static translateSeverityLevel(level: string): string {
    const translations: Record<string, string> = {
      "normal": "Normal",
      "mild": "Leve",
      "moderate": "Moderada",
      "severe": "Severa"
    };
    return translations[level] || level;
  }
}
