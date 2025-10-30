import { User, Deck, Card, StudyLog } from '../types';

// --- Spaced Repetition Logic (simplified SM-2) ---
const MIN_EASE_FACTOR = 1.3;

function calculateSpacedRepetition(card: Card, performance: number): Partial<Card> {
  let { easeFactor, interval } = card;

  if (performance < 3) {
    // Incorrect
    interval = 1;
  } else {
    // Correct or Close
    easeFactor = easeFactor + (0.1 - (5 - performance) * (0.08 + (5 - performance) * 0.02));
    if (easeFactor < MIN_EASE_FACTOR) {
      easeFactor = MIN_EASE_FACTOR;
    }
    
    if (interval <= 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easeFactor,
    interval,
    nextReviewDate: nextReviewDate.toISOString(),
  };
}

// --- Mock API with localStorage persistence ---

export interface AuthCredentials {
  email: string;
  password?: string; // Not used in mock, but good for interface
}

class MockApi {
  private currentUser: User | null = null;

  private getTable<T>(name: string): T[] {
    try {
      const data = localStorage.getItem(`mm_${name}`);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  private setTable<T>(name: string, data: T[]): void {
    localStorage.setItem(`mm_${name}`, JSON.stringify(data));
  }

  async init() {
    const userJson = localStorage.getItem('mm_currentUser');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
    }
    
    // Seed data if none exists
    if (!localStorage.getItem('mm_seeded')) {
      const seedUser = { uid: 'user1', email: 'test@example.com' };
      this.setTable<User>('users', [seedUser]);

      const seedDeck1: Deck = { id: 'deck1', title: 'React Hooks', description: 'Mastering React Hooks', userId: 'user1', cardCount: 3, dueCount: 3 };
      const seedDeck2: Deck = { id: 'deck2', title: 'Cognitive Science', description: 'Foundational concepts in the study of mind and intelligence.', userId: 'user1', cardCount: 0, dueCount: 0 };
      this.setTable<Deck>('decks', [seedDeck1, seedDeck2]);


      const now = new Date().toISOString();
      const seedCards1: Card[] = [
        { id: 'card1', deckId: 'deck1', question: 'What is `useState`?', answer: 'A Hook that lets you add React state to function components.', nextReviewDate: now, interval: 1, easeFactor: 2.5, lastConfidence: null, lastPerformance: null },
        { id: 'card2', deckId: 'deck1', question: 'What is `useEffect`?', answer: 'A Hook that lets you perform side effects in function components.', nextReviewDate: now, interval: 1, easeFactor: 2.5, lastConfidence: null, lastPerformance: null },
        { id: 'card3', deckId: 'deck1', question: 'What is the second argument to `useEffect` for?', answer: 'The dependency array. The effect only re-runs if a dependency has changed.', nextReviewDate: now, interval: 1, easeFactor: 2.5, lastConfidence: null, lastPerformance: null }
      ];

      const cogSciData = [
        { question: 'Cognitive Science (Definition)', answer: 'The interdisciplinary scientific study of the mind and its processes, drawing from psychology, computer science, neuroscience, linguistics, philosophy, and anthropology.' },
        { question: 'Core Question of CogSci', answer: 'How does the mind work to produce intelligent behavior?' },
        { question: 'CRUM', answer: 'Computational-Representational Understanding of Mind. The hypothesis that thinking is a process of performing computations on mental representations.' },
        { question: 'Interdisciplinary Fields (6)', answer: 'Psychology, Philosophy, Computer Science (AI), Neuroscience, Linguistics, Anthropology.' },
        { question: 'Marr\'s Three Levels of Analysis', answer: 'Computational, Algorithmic, and Implementational.' },
        { question: 'Computational Level (Marr)', answer: 'What is the goal of the computation? What problem does the system solve?' },
        { question: 'Algorithmic Level (Marr)', answer: 'How does the system solve the problem? What representations and algorithms are used?' },
        { question: 'Implementational Level (Marr)', answer: 'How is the computation physically realized? (e.g., in neurons, silicon chips)' },
        { question: 'Logic Paradigm (Thagard)', answer: 'Mental processes are seen as logical deductions using formal rules.' },
        { question: 'Propositions', answer: 'Declarative statements that can be either true or false. The basic unit of logic.' },
        { question: 'Predicate Calculus', answer: 'A formal language used in logic to express propositions about objects and their properties/relations.' },
        { question: 'Weakness of Logic Paradigm', answer: 'Difficulty handling uncertainty, scalability (combinatorial explosion), and the \'frame problem\'.' },
        { question: 'Rules Paradigm (Thagard)', answer: 'Thinking consists of applying \'IF-THEN\' rules (productions) to information.' },
        { question: 'Production System', answer: 'A model of cognition consisting of three parts: rule base, context (working memory), and an interpreter (rule-firing mechanism).' },
        { question: 'SOAR', answer: 'A cognitive architecture based on production rules that attempts to model all of human cognition.' },
        { question: 'Weakness of Rules Paradigm', answer: 'Difficulty in rule acquisition (learning) and explaining the \'graceful degradation\' seen in human cognition.' },
        { question: 'Concepts Paradigm (Thagard)', answer: 'Thinking involves the application and manipulation of concepts, which are mental representations of categories.' },
        { question: 'Classical View of Concepts', answer: 'Concepts are defined by a set of necessary and sufficient features (e.g., a \'bachelor\' is \'unmarried\' AND \'male\').' },
        { question: 'Prototype View of Concepts', answer: 'Concepts are organized around a \'prototype\' or \'best example\' of the category. Membership is graded.' },
        { question: 'Exemplar View of Concepts', answer: 'Concepts are represented by storing all (or many) previously encountered examples (exemplars) of the category.' },
        { question: 'Frames (Minsky)', answer: 'Data structures that represent stereotyped situations or objects. They have \'slots\' for attributes and \'fillers\' for values.' },
        { question: 'Scripts (Schank)', answer: 'A type of schema (related to frames) that represents a stereotyped sequence of events (e.g., \'restaurant script\').' },
        { question: 'Weakness of Concepts Paradigm', answer: 'How are concepts learned? How do they combine? How are they grounded in perception and action?' },
        { question: 'Analogy Paradigm (Thagard)', answer: 'Thinking involves using knowledge of one situation (the \'source\') to understand another situation (the \'target\').' },
        { question: 'Steps in Analogical Reasoning', answer: '1. Retrieval (finding a source), 2. Mapping (aligning source and target), 3. Transfer (making inferences), 4. Evaluation.' },
        { question: 'ACME (Holyoak & Thagard)', answer: 'A computational model of analogical mapping (Analogical Constraint Mapping Engine) that uses parallel constraint satisfaction.' },
        { question: 'Weakness of Analogy Paradigm', answer: 'The \'retrieval\' problem: How do we find a good source analogy from the vastness of memory?' },
        { question: 'Images Paradigm (Thagard)', answer: 'Thinking involves the use of quasi-perceptual, visual mental representations.' },
        { question: 'The \'Imagery Debate\'', answer: 'A debate about whether mental images are \'pictures in the head\' (pictorial) or non-pictual (descriptive/propositional) representations.' },
        { question: 'Kosslyn\'s View (Imagery)', answer: 'Mental images are pictorial and depictive; they re-use parts of the brain\'s perceptual machinery.' },
        { question: 'Pylyshyn\'s View (Imagery)', answer: 'Mental images are \'epiphenomenal\'. The underlying representation is propositional (like language), not pictorial.' },
        { question: 'Evidence for Pictorial View', answer: 'Mental rotation tasks, image scanning tasks (Kosslyn\'s map).' },
        { question: 'Weakness of Images Paradigm', answer: 'How are images formed? How do they interact with other representations (like language)?' },
        { question: 'Connections Paradigm (Thagard)', answer: 'Thinking is a process of parallel constraint satisfaction in a network of simple, interconnected units.' },
        { question: 'Connectionism', answer: 'Another name for the \'Connections\' paradigm, often associated with Parallel Distributed Processing (PDP) and neural networks.' },
        { question: 'Neural Network (Artificial)', answer: 'A computational model inspired by the structure of the brain, consisting of nodes (neurons) and weighted links (synapses).' },
        { question: 'Perceptron', answer: 'A simple, single-layer neural network. Can only solve linearly separable problems.' },
        { question: 'Backpropagation', answer: 'A learning algorithm for multi-layer neural networks that adjusts weights by propagating error signals backward through the network.' },
        { question: 'Graceful Degradation', answer: 'A property of connectionist models (and brains) where performance declines gradually as parts of the system are damaged.' },
        { question: 'Weakness of Connections Paradigm', answer: 'Difficulty explaining systematic, rule-like behavior (like language syntax) and \'one-shot\' learning.' },
        { question: 'Cognitive Architecture', answer: 'A broad, unified theory of the structure and function of the human mind, often implemented as a computational model.' },
        { question: 'Examples of Cognitive Archs.', answer: 'SOAR (rule-based), ACT-R (hybrid), connectionist models.' },
        { question: 'ACT-R (Anderson)', answer: 'A hybrid cognitive architecture that combines a symbolic (rule-based) system with subsymbolic (connectionist-like) activations.' },
        { question: 'Embodied Cognition', answer: 'The thesis that the mind cannot be understood in isolation from the body and the environment in which it acts.' },
        { question: 'Embodied Cog. Slogan', answer: '"Thinking is for doing."' },
        { question: 'Affordances (J.J. Gibson)', answer: 'The action possibilities that an environment offers an agent (e.g., a chair \'affords\' sitting).' },
        { question: 'Critique of \'Sandwich\' Model', answer: 'Embodied cognition rejects the traditional model of \'perception -> cognition -> action\' as separate, sequential modules.' },
        { question: 'Rodney Brooks (Embodied Cog.)', answer: 'AI researcher who built insect-like robots based on a \'subsumption architecture\' (no central representation).' },
        { question: 'Subsumption Architecture', answer: 'A reactive robotic architecture where simple behavioral layers are \'subsumed\' by higher-level ones, without a central planner.' },
        { question: 'Distributed Cognition (D-Cog)', answer: 'The thesis that cognitive processes are not confined to an individual\'s mind but are distributed across individuals, tools, and the environment.' },
        { question: 'Unit of Analysis in D-Cog', answer: 'Not the individual, but the entire cognitive \'system\' (e.g., a cockpit crew + their instruments).' },
        { question: 'Ed Hutchins', answer: 'An anthropologist and key figure in Distributed Cognition, famous for his study of navigation on a naval ship (\'Cognition in the Wild\').' },
        { question: 'Cognitive Artifacts', answer: 'Man-made tools that aid or augment cognitive processes (e.g., a checklist, a calculator, a knot in a handkerchief).' },
        { question: 'Neuroscience (Definition)', answer: 'The scientific study of the nervous system, especially the brain.' },
        { question: 'Neuron', answer: 'The basic information-processing cell of the nervous system.' },
        { question: 'Synapse', answer: 'The junction between two neurons where signals are transmitted (usually via neurotransmitters).' },
        { question: 'Hebbian Learning', answer: '"Neurons that fire together, wire together." A basic principle of synaptic plasticity (learning).' },
        { question: 'fMRI (functional MRI)', answer: 'A neuroimaging technique that measures brain activity by detecting changes in blood oxygenation levels (BOLD signal).' },
        { question: 'EEG (Electroencephalography)', answer: 'A neuroimaging technique that measures electrical activity in the brain via electrodes placed on the scalp. High temporal resolution.' },
        { question: 'Temporal Resolution (Neuro)', answer: 'The precision of a measurement with respect to time (e.g., EEG is high, fMRI is low).' },
        { question: 'Spatial Resolution (Neuro)', answer: 'The precision of a measurement with respect to location in the brain (e.g., fMRI is high, EEG is low).' },
        { question: 'Philosophy of Mind', answer: 'The branch of philosophy that studies the nature of the mind, mental events, mental functions, and consciousness.' },
        { question: 'Mind-Body Problem', answer: 'The fundamental philosophical question of how mental states (like beliefs or pain) are related to physical states (like brain activity).' },
        { question: 'Dualism (Descartes)', answer: 'The view that the mind (mental) and body (physical) are two distinct and separable substances.' },
        { question: 'Materialism / Physicalism', answer: 'The view that everything that exists is physical, or supervenes on the physical. The mind is what the brain does.' },
        { question: 'Functionalism', answer: 'The view that mental states are defined by their functional role (their inputs, outputs, and relations to other states), not by their physical implementation.' },
        { question: 'Chinese Room Argument (Searle)', answer: 'A thought experiment arguing that a program (like AI) can pass the Turing Test without genuine \'understanding\' or \'consciousness\'.' },
        { question: 'Turing Test (Alan Turing)', answer: 'A test of a machine\'s ability to exhibit intelligent behavior equivalent to, or indistinguishable from, that of a human.' },
        { question: 'Consciousness', answer: 'The state of subjective awareness, qualitative experience, and \'what it is like\' to be something.' },
        { question: 'The \'Easy Problem\' of Consc.', answer: 'Explaining the functional aspects of consciousness: how the brain processes information, integrates it, and produces behavior.' },
        { question: 'The \'Hard Problem\' of Consc. (Chalmers)', answer: 'Explaining the subjective, qualitative aspect of consciousness (qualia): why and how brain processes give rise to experience.' },
        { question: 'Linguistics (Definition)', answer: 'The scientific study of language.' },
        { question: 'Chomsky\'s Critique of Behaviorism', answer: 'Argued that behaviorism (Skinner) could not explain language acquisition, citing the \'poverty of the stimulus\' and \'creativity\' of language.' },
        { question: 'Universal Grammar (Chomsky)', answer: 'The hypothesis that the human brain is innately equipped with a set of principles and parameters that govern all human languages.' },
        { question: 'Poverty of the Stimulus', answer: 'The argument that children are not exposed to enough (or high-quality) data to learn the complexities of language purely through induction.' },
        { question: 'Whorfian Hypothesis (Sapir-Whorf)', answer: 'The hypothesis that the language one speaks influences the way one thinks and perceives the world.' },
        { question: 'Linguistic Determinism (Strong Whorf)', answer: 'The idea that language determines thought. (Largely rejected).' },
        { question: 'Linguistic Relativity (Weak Whorf)', answer: 'The idea that language influences thought and perception. (More accepted).' },
        { question: 'Phoneme', answer: 'The smallest unit of sound in a language that can distinguish meaning (e.g., /b/ vs /p/ in \'bat\' vs \'pat\').' },
        { question: 'Morpheme', answer: 'The smallest unit of meaning in a language (e.g., \'un-\' or \'dog\' or \'-s\').' },
        { question: 'Syntax', answer: 'The rules governing how words are combined to form grammatically correct sentences.' },
        { question: 'Semantics', answer: 'The study of meaning in language.' },
        { question: 'Pragmatics', answer: 'The study of how context influences the interpretation of language (e.g., "Can you pass the salt?" is a request, not a question).' },
        { question: 'Memory (Definition)', answer: 'The cognitive processes of encoding, storing, and retrieving information.' },
        { question: 'Sensory Memory', answer: 'A very brief (milliseconds to seconds) buffer for sensory information (e.g., iconic memory for vision).' },
        { question: 'Short-Term Memory (STM)', answer: 'A memory system with limited capacity (7 +/- 2 chunks) and limited duration (seconds) without rehearsal.' },
        { question: 'Working Memory (Baddeley)', answer: 'An active system for temporarily storing and manipulating information. Includes the phonological loop, visuospatial sketchpad, and central executive.' },
        { question: 'Long-Term Memory (LTM)', answer: 'A memory system with vast, seemingly unlimited capacity and very long duration.' },
        { question: 'Declarative (Explicit) Memory', answer: 'A type of LTM for facts and events that can be consciously recalled. Subdivided into episodic and semantic.' },
        { question: 'Episodic Memory', answer: 'Declarative memory for specific personal events and experiences (e.g., \'my 10th birthday party\').' },
        { question: 'Semantic Memory', answer: 'Declarative memory for general world knowledge and facts (e.g., \'Paris is the capital of France\').' },
        { question: 'Non-Declarative (Implicit) Memory', answer: 'A type of LTM that influences behavior without conscious awareness (e.g., procedural memory, priming).' },
        { question: 'Procedural Memory', answer: 'Implicit memory for skills and \'how-to\' knowledge (e.g., riding a bike).' },
        { question: 'Priming', answer: 'An implicit memory effect where exposure to one stimulus influences the response to a subsequent stimulus.' },
        { question: 'Problem Solving (Definition)', answer: 'The cognitive process of finding a way to achieve a goal when the path is not obvious.' },
        { question: 'Newell & Simon (Problem Solving)', answer: 'Pioneers who viewed problem solving as a search through a \'problem space\'.' },
        { question: 'Problem Space', answer: 'A mental representation of a problem, consisting of an initial state, a goal state, and a set of operators (moves) to get from one to the other.' },
        { question: 'Heuristic', answer: 'A cognitive \'rule of thumb\' or shortcut that is not guaranteed to be optimal but is efficient for finding a solution.' },
        { question: 'Means-Ends Analysis', answer: 'A problem-solving heuristic that involves repeatedly calculating the difference between the current state and the goal state, then applying an operator to reduce that difference.' },
        { question: 'Insight (Problem Solving)', answer: 'The sudden and often novel realization of a solution to a problem.' },
        { question: 'Functional Fixedness', answer: 'A cognitive bias that limits a person to using an object only in the way it is traditionally used.' },
        { question: 'Learning (Definition)', answer: 'A relatively permanent change in behavior or knowledge that results from experience.' },
        { question: 'Classical Conditioning (Pavlov)', answer: 'Learning by association, where a neutral stimulus comes to elicit a response after being paired with a stimulus that naturally elicits that response.' },
        { question: 'Operant Conditioning (Skinner)', answer: 'Learning where behavior is strengthened or weakened by its consequences (reinforcement or punishment).' },
        { question: 'Observational Learning (Bandura)', answer: 'Learning by observing and imitating the behavior of others (models).' },
        { question: 'AI and Cognitive Science', answer: 'AI provides tools (computational models) to test theories of cognition, while CogSci provides insights into human intelligence to build better AI.' },
        { question: 'Symbolic AI (GOFAI)', answer: '\'Good Old-Fashioned AI\'. A top-down approach that emphasizes symbolic representations and logical rules.' },
        { question: 'Sub-symbolic AI', answer: 'A bottom-up approach (like connectionism) that emphasizes simple, non-symbolic units and emergent properties.' },
        { question: 'Cognition & Emotion', answer: 'The view that emotion is not separate from cognition, but is intertwined with processes like appraisal, memory, and decision-making.' },
        { question: 'Damasio\'s Somatic Marker Hypothesis', answer: 'The theory that emotions and bodily \'somatic markers\' guide (or bias) decision-making, especially in complex situations.' },
        { question: 'Cognition & Culture', answer: 'The study of how cultural contexts shape and influence cognitive processes.' },
        { question: 'Tomasello (Culture)', answer: 'Argues that the key difference in human cognition is \'shared intentionality\'—the ability to collaborate and share mental states.' },
        { question: 'Cognition & Design (HCI)', answer: 'Applying principles of cognitive science to design user-friendly and effective tools, interfaces, and systems (Human-Computer Interaction).' },
        { question: 'Don Norman ("Design of Everyday Things")', answer: 'Advocate for \'human-centered design\' that leverages cognitive principles like affordances, signifiers, and feedback.' },
        { question: 'Cognition & Robotics', answer: 'Using robotics to test models of embodied and situated cognition.' },
      ];
      
      const seedCards2: Card[] = cogSciData.map((card, index) => ({
        id: `card_cs_${index + 1}`,
        deckId: 'deck2',
        question: card.question,
        answer: card.answer,
        nextReviewDate: now,
        interval: 1,
        easeFactor: 2.5,
        lastConfidence: null,
        lastPerformance: null,
      }));


      this.setTable<Card>('cards', [...seedCards1, ...seedCards2]);

      localStorage.setItem('mm_seeded', 'true');
    }
  }

  // --- Auth ---
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async login(credentials: AuthCredentials): Promise<User> {
    const users = this.getTable<User>('users');
    const user = users.find(u => u.email === credentials.email);
    if (user) {
      this.currentUser = user;
      localStorage.setItem('mm_currentUser', JSON.stringify(user));
      return user;
    }
    throw new Error('User not found');
  }

  async signup(credentials: AuthCredentials): Promise<User> {
    const users = this.getTable<User>('users');
    if (users.some(u => u.email === credentials.email)) {
      throw new Error('User already exists');
    }
    const newUser: User = { uid: `user${Date.now()}`, email: credentials.email };
    users.push(newUser);
    this.setTable('users', users);
    this.currentUser = newUser;
    localStorage.setItem('mm_currentUser', JSON.stringify(newUser));
    return newUser;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('mm_currentUser');
  }

  // --- DB ---
  private assertUser(): string {
    if (!this.currentUser) throw new Error("Not authenticated");
    return this.currentUser.uid;
  }
  
  async getDecks(): Promise<Deck[]> {
    const userId = this.assertUser();
    const decks = this.getTable<Deck>('decks').filter(d => d.userId === userId);
    const cards = this.getTable<Card>('cards');
    const now = new Date();
    
    return decks.map(deck => {
        const deckCards = cards.filter(c => c.deckId === deck.id);
        const dueCount = deckCards.filter(c => new Date(c.nextReviewDate) <= now).length;
        return {...deck, cardCount: deckCards.length, dueCount };
    });
  }
  
  async getDeck(deckId: string): Promise<Deck | null> {
    this.assertUser();
    const deck = this.getTable<Deck>('decks').find(d => d.id === deckId);
    return deck || null;
  }

  async addDeck(title: string, description: string): Promise<Deck> {
    const userId = this.assertUser();
    const decks = this.getTable<Deck>('decks');
    const newDeck: Deck = { id: `deck${Date.now()}`, title, description, userId, cardCount: 0, dueCount: 0 };
    decks.push(newDeck);
    this.setTable('decks', decks);
    return newDeck;
  }

  async getCards(deckId: string): Promise<Card[]> {
    this.assertUser();
    return this.getTable<Card>('cards').filter(c => c.deckId === deckId);
  }

  async addCard(deckId: string, question: string, answer: string): Promise<Card> {
    this.assertUser();
    const cards = this.getTable<Card>('cards');
    const newCard: Card = {
      id: `card${Date.now()}`,
      deckId,
      question,
      answer,
      nextReviewDate: new Date().toISOString(),
      interval: 1,
      easeFactor: 2.5,
      lastConfidence: null,
      lastPerformance: null,
    };
    cards.push(newCard);
    this.setTable('cards', cards);
    return newCard;
  }

  async getDueCards(deckId: string): Promise<Card[]> {
    this.assertUser();
    const now = new Date();
    return this.getTable<Card>('cards')
      .filter(c => c.deckId === deckId && new Date(c.nextReviewDate) <= now);
  }

  async updateCardAfterStudy(cardId: string, confidence: number, performance: number): Promise<void> {
    const userId = this.assertUser();
    const cards = this.getTable<Card>('cards');
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) throw new Error('Card not found');

    const card = cards[cardIndex];
    const updatedSrData = calculateSpacedRepetition(card, performance);

    cards[cardIndex] = {
      ...card,
      ...updatedSrData,
      lastConfidence: confidence,
      lastPerformance: performance
    };
    this.setTable('cards', cards);
    
    // Add a study log
    const studyLogs = this.getTable<StudyLog>('studyLogs');
    const newLog: StudyLog = {
      id: `log${Date.now()}`,
      userId,
      deckId: card.deckId,
      cardId,
      timestamp: new Date().toISOString(),
      confidence,
      performance,
    };
    studyLogs.push(newLog);
    this.setTable('studyLogs', studyLogs);
  }
  
  async getStudyLogs(deckId?: string): Promise<StudyLog[]> {
    const userId = this.assertUser();
    let logs = this.getTable<StudyLog>('studyLogs').filter(l => l.userId === userId);
    if (deckId) {
        logs = logs.filter(l => l.deckId === deckId);
    }
    return logs.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}

export const api = new MockApi();