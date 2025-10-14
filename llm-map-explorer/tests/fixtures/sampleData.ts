/**
 * Sample data for testing type definitions
 */

import type {
  Capability,
  Landmark,
  Organization,
  Tour,
  ModelLandmark,
} from '@/types';

export const sampleCapability: Capability = {
  id: 'attention-mechanisms',
  name: 'Attention Mechanisms',
  description: 'Core techniques for modeling relationships in sequences',
  shortDescription: 'Sequence modeling techniques',
  level: 'archipelago',
  polygonCoordinates: [
    { lat: 100, lng: 200 },
    { lat: 150, lng: 200 },
    { lat: 150, lng: 250 },
    { lat: 100, lng: 250 },
  ],
  visualStyleHints: {
    fillColor: '#3b82f6',
    fillOpacity: 0.3,
    strokeColor: '#1e40af',
    strokeWeight: 2,
    pattern: 'solid',
  },
  relatedLandmarks: ['attention-is-all-you-need', 'bert'],
  zoomThreshold: 2,
};

export const sampleLandmark: Landmark = {
  id: 'attention-is-all-you-need',
  name: 'Attention Is All You Need',
  type: 'paper',
  year: 2017,
  organization: 'Google Brain',
  authors: ['Vaswani et al.'],
  description: 'Introduced the Transformer architecture',
  abstract: 'The dominant sequence transduction models...',
  externalLinks: [
    {
      type: 'arxiv',
      url: 'https://arxiv.org/abs/1706.03762',
      label: 'arXiv Paper',
    },
  ],
  coordinates: { lat: 125, lng: 225 },
  capabilityId: 'attention-mechanisms',
  relatedLandmarks: ['bert', 'gpt-2'],
  tags: ['transformer', 'attention', 'nlp'],
};

export const sampleModelLandmark: ModelLandmark = {
  id: 'gpt-3',
  name: 'GPT-3',
  type: 'model',
  year: 2020,
  organization: 'OpenAI',
  description: 'Large-scale language model with 175B parameters',
  externalLinks: [
    {
      type: 'paper',
      url: 'https://arxiv.org/abs/2005.14165',
      label: 'GPT-3 Paper',
    },
  ],
  coordinates: { lat: 200, lng: 300 },
  capabilityId: 'language-models',
  relatedLandmarks: ['gpt-2', 'instruct-gpt'],
  tags: ['gpt', 'language-model', 'few-shot'],
  metadata: {
    parameters: '175B',
    architecture: 'Transformer',
    trainingMethod: 'Unsupervised pre-training',
    capabilities: ['text-generation', 'few-shot-learning'],
    releaseDate: '2020-05-28',
    license: 'Proprietary',
  },
};

export const sampleOrganization: Organization = {
  id: 'openai',
  name: 'OpenAI',
  description: 'AI research and deployment company',
  website: 'https://openai.com',
  landmarkIds: ['gpt-2', 'gpt-3', 'gpt-4', 'instruct-gpt'],
  color: '#10a37f',
  logo: 'https://openai.com/logo.png',
};

export const sampleTour: Tour = {
  id: 'gpt-evolution',
  title: 'The Evolution of GPT',
  description: 'Journey through the GPT model series',
  stages: [
    {
      index: 0,
      title: 'GPT-1: The Beginning',
      description: 'First generative pre-trained transformer',
      landmarkIds: ['gpt-1'],
      mapCenter: { lat: 150, lng: 250 },
      mapZoom: 3,
      narration: 'In 2018, OpenAI introduced GPT-1...',
    },
    {
      index: 1,
      title: 'GPT-2: Scaling Up',
      description: 'Larger model with better performance',
      landmarkIds: ['gpt-2'],
      mapCenter: { lat: 175, lng: 275 },
      mapZoom: 3,
      narration: 'GPT-2 demonstrated the power of scale...',
    },
  ],
  estimatedDuration: 15,
  difficulty: 'beginner',
  tags: ['gpt', 'openai', 'language-models'],
};
