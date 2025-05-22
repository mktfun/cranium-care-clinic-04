
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export function MedikranTestimonials() {
  return (
    <AnimatedTestimonials
      title="Feedback dos nossos usuários"
      subtitle="Veja o que os profissionais de saúde estão dizendo sobre o Medikran e como ele tem ajudado em suas práticas clínicas."
      badgeText="Aprovado por especialistas"
      testimonials={[
        {
          id: 1,
          name: "Dra. Helena Rodrigues",
          role: "Fisioterapeuta Pediátrica",
          company: "Centro de Reabilitação Infantil",
          content: "O Medikran transformou minha prática clínica. As medições precisas e os relatórios detalhados me permitem acompanhar o progresso dos meus pacientes com muito mais eficiência.",
          rating: 5,
          avatar: "https://randomuser.me/api/portraits/women/65.jpg",
        },
        {
          id: 2,
          name: "Dr. Carlos Silva",
          role: "Neuropediatra",
          company: "Hospital Santa Casa",
          content: "Como médico, valorizo muito a precisão dos dados fornecidos pelo Medikran. A interface é intuitiva e me permite tomar decisões clínicas baseadas em informações confiáveis.",
          rating: 5,
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        },
        {
          id: 3,
          name: "Dra. Mariana Costa",
          role: "Terapeuta Ocupacional",
          company: "Clínica Desenvolvimento Infantil",
          content: "O sistema de acompanhamento craniano do Medikran é excepcional. Consigo visualizar a evolução dos casos de plagiocefalia de forma clara e objetiva, o que facilita até mesmo a explicação para os pais.",
          rating: 5,
          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        },
      ]}
      trustedCompanies={["Hospital Albert Einstein", "AACD", "Santa Casa", "Hospital Sírio-Libanês", "Sabará Hospital Infantil"]}
      trustedCompaniesTitle="Utilizado por profissionais de instituições renomadas"
      className="py-16"
    />
  );
}
