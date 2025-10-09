// Lista de áreas de interesse pré-definidas organizadas por categoria
export const STUDY_AREAS = [
  // Exatas
  { name: 'Matemática', category: 'Exatas', color: '#3b82f6' },
  { name: 'Física', category: 'Exatas', color: '#3b82f6' },
  { name: 'Química', category: 'Exatas', color: '#3b82f6' },
  { name: 'Estatística', category: 'Exatas', color: '#3b82f6' },
  { name: 'Cálculo', category: 'Exatas', color: '#3b82f6' },
  { name: 'Álgebra', category: 'Exatas', color: '#3b82f6' },
  { name: 'Geometria', category: 'Exatas', color: '#3b82f6' },

  // Tecnologia
  { name: 'Programação', category: 'Tecnologia', color: '#10b981' },
  { name: 'Ciência da Computação', category: 'Tecnologia', color: '#10b981' },
  { name: 'Desenvolvimento Web', category: 'Tecnologia', color: '#10b981' },
  { name: 'Inteligência Artificial', category: 'Tecnologia', color: '#10b981' },
  { name: 'Cybersecurity', category: 'Tecnologia', color: '#10b981' },
  { name: 'Banco de Dados', category: 'Tecnologia', color: '#10b981' },
  { name: 'Redes de Computadores', category: 'Tecnologia', color: '#10b981' },
  { name: 'DevOps', category: 'Tecnologia', color: '#10b981' },
  { name: 'Mobile Development', category: 'Tecnologia', color: '#10b981' },

  // Engenharias
  { name: 'Engenharia Civil', category: 'Engenharias', color: '#f59e0b' },
  { name: 'Engenharia Elétrica', category: 'Engenharias', color: '#f59e0b' },
  { name: 'Engenharia Mecânica', category: 'Engenharias', color: '#f59e0b' },
  { name: 'Engenharia de Software', category: 'Engenharias', color: '#f59e0b' },
  { name: 'Engenharia Química', category: 'Engenharias', color: '#f59e0b' },
  { name: 'Engenharia de Produção', category: 'Engenharias', color: '#f59e0b' },
  { name: 'Engenharia Ambiental', category: 'Engenharias', color: '#f59e0b' },

  // Biológicas/Saúde
  { name: 'Medicina', category: 'Biológicas', color: '#ef4444' },
  { name: 'Biologia', category: 'Biológicas', color: '#ef4444' },
  { name: 'Farmácia', category: 'Biológicas', color: '#ef4444' },
  { name: 'Enfermagem', category: 'Biológicas', color: '#ef4444' },
  { name: 'Veterinária', category: 'Biológicas', color: '#ef4444' },
  { name: 'Odontologia', category: 'Biológicas', color: '#ef4444' },
  { name: 'Fisioterapia', category: 'Biológicas', color: '#ef4444' },
  { name: 'Psicologia', category: 'Biológicas', color: '#ef4444' },
  { name: 'Nutrição', category: 'Biológicas', color: '#ef4444' },
  { name: 'Biomedicina', category: 'Biológicas', color: '#ef4444' },

  // Humanas
  { name: 'História', category: 'Humanas', color: '#8b5cf6' },
  { name: 'Geografia', category: 'Humanas', color: '#8b5cf6' },
  { name: 'Filosofia', category: 'Humanas', color: '#8b5cf6' },
  { name: 'Sociologia', category: 'Humanas', color: '#8b5cf6' },
  { name: 'Antropologia', category: 'Humanas', color: '#8b5cf6' },
  { name: 'Ciências Políticas', category: 'Humanas', color: '#8b5cf6' },
  { name: 'Relações Internacionais', category: 'Humanas', color: '#8b5cf6' },
  { name: 'Pedagogia', category: 'Humanas', color: '#8b5cf6' },
  { name: 'Jornalismo', category: 'Humanas', color: '#8b5cf6' },
  { name: 'Comunicação Social', category: 'Humanas', color: '#8b5cf6' },

  // Direito
  { name: 'Direito', category: 'Direito', color: '#6d28d9' },
  { name: 'Direito Civil', category: 'Direito', color: '#6d28d9' },
  { name: 'Direito Penal', category: 'Direito', color: '#6d28d9' },
  { name: 'Direito Trabalhista', category: 'Direito', color: '#6d28d9' },
  { name: 'Direito Constitucional', category: 'Direito', color: '#6d28d9' },

  // Negócios
  { name: 'Administração', category: 'Negócios', color: '#06b6d4' },
  { name: 'Marketing', category: 'Negócios', color: '#06b6d4' },
  { name: 'Economia', category: 'Negócios', color: '#06b6d4' },
  { name: 'Contabilidade', category: 'Negócios', color: '#06b6d4' },
  { name: 'Finanças', category: 'Negócios', color: '#06b6d4' },
  { name: 'Recursos Humanos', category: 'Negócios', color: '#06b6d4' },
  { name: 'Empreendedorismo', category: 'Negócios', color: '#06b6d4' },
  { name: 'Logística', category: 'Negócios', color: '#06b6d4' },

  // Linguagens
  { name: 'Português', category: 'Linguagens', color: '#ec4899' },
  { name: 'Inglês', category: 'Linguagens', color: '#ec4899' },
  { name: 'Espanhol', category: 'Linguagens', color: '#ec4899' },
  { name: 'Literatura', category: 'Linguagens', color: '#ec4899' },
  { name: 'Francês', category: 'Linguagens', color: '#ec4899' },
  { name: 'Alemão', category: 'Linguagens', color: '#ec4899' },
  { name: 'Italiano', category: 'Linguagens', color: '#ec4899' },
  { name: 'Japonês', category: 'Linguagens', color: '#ec4899' },
  { name: 'Chinês', category: 'Linguagens', color: '#ec4899' },

  // Artes
  { name: 'Design Gráfico', category: 'Artes', color: '#84cc16' },
  { name: 'Design UX/UI', category: 'Artes', color: '#84cc16' },
  { name: 'Artes Visuais', category: 'Artes', color: '#84cc16' },
  { name: 'Música', category: 'Artes', color: '#84cc16' },
  { name: 'Teatro', category: 'Artes', color: '#84cc16' },
  { name: 'Cinema', category: 'Artes', color: '#84cc16' },
  { name: 'Fotografia', category: 'Artes', color: '#84cc16' },
  { name: 'Arquitetura', category: 'Artes', color: '#84cc16' },
  { name: 'Design de Interiores', category: 'Artes', color: '#84cc16' },

  // Concursos
  { name: 'Concursos Públicos', category: 'Concursos', color: '#a855f7' },
  { name: 'ENEM', category: 'Concursos', color: '#a855f7' },
  { name: 'Vestibular', category: 'Concursos', color: '#a855f7' },
  { name: 'OAB', category: 'Concursos', color: '#a855f7' },
  { name: 'Residência Médica', category: 'Concursos', color: '#a855f7' },
];

// Função para obter categorias únicas
export const getCategories = () => {
  const categories = [...new Set(STUDY_AREAS.map(area => area.category))];
  return categories.sort();
};

// Função para obter áreas por categoria
export const getAreasByCategory = (category) => {
  return STUDY_AREAS.filter(area => area.category === category);
};

// Função para buscar áreas
export const searchAreas = (searchTerm) => {
  if (!searchTerm) return STUDY_AREAS;
  const term = searchTerm.toLowerCase();
  return STUDY_AREAS.filter(area =>
    area.name.toLowerCase().includes(term) ||
    area.category.toLowerCase().includes(term)
  );
};