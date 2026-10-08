import type { QuestionId } from '../types';

export interface QuestionOption {
  key: string;
  text: string;
  /** Sentence used on the result card when this answer drove the decision. */
  reason: string;
}

export interface Question {
  id: QuestionId;
  title: string;
  prompt: string;
  options: QuestionOption[];
}

/** Copy uses {A} and {B} placeholders for the user's good names. */
export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    title: 'The swap test',
    prompt: 'You have some {A} and some {B}. Would you swap between them at a fixed rate?',
    options: [
      {
        key: 'a',
        text: 'Yes, at one fixed rate, always. (e.g. 1 {B} is always worth exactly 2 {A})',
        reason: 'you would always swap {A} for {B} at one fixed rate',
      },
      {
        key: 'b',
        text: 'It depends: the more of one I have, the less I want extra of it. I like a mix.',
        reason: 'the more {A} you have, the less you want extra of it',
      },
      {
        key: 'c',
        text: 'No. They only work together. Extra of one is pointless without the other.',
        reason: '{A} and {B} only work together',
      },
    ],
  },
  {
    id: 'q2',
    title: 'The extra-units test',
    prompt: 'You hold 10 {A} and 10 {B}. Someone gives you 5 more {A} and nothing else. How much better off are you?',
    options: [
      { key: 'a', text: "Not at all. I'm limited by {B}.", reason: 'extra {A} is useless without more {B}' },
      {
        key: 'b',
        text: 'A bit better, but less than the first 5 felt.',
        reason: 'each extra {A} helps a little less than the last',
      },
      {
        key: 'c',
        text: "Exactly as much better as if I'd got the equivalent amount of {B}.",
        reason: 'extra {A} is worth exactly its equivalent in {B}',
      },
      {
        key: 'd',
        text: "Better, but each extra {A} matters less, and getting richer wouldn't make me buy more {A}.",
        reason: 'your appetite for {A} levels off no matter how rich you are',
      },
    ],
  },
  {
    id: 'q3',
    title: 'The income test',
    prompt: 'Your budget doubles. What do you do?',
    options: [
      { key: 'a', text: 'Buy about double of both.', reason: 'a bigger budget means double of both' },
      {
        key: 'b',
        text: 'Keep {A} about the same and put the extra into {B} (or other things).',
        reason: 'a bigger budget all goes to {B} while {A} stays put',
      },
      {
        key: 'c',
        text: 'Put nearly all of the extra into one of them.',
        reason: 'you would put a bigger budget into just one good',
      },
    ],
  },
  {
    id: 'q4',
    title: 'The price test',
    prompt: 'The price of {A} doubles. What happens?',
    options: [
      {
        key: 'a',
        text: 'I buy roughly half as much {A} and spend about the same on it as before.',
        reason: 'you keep spending the same amount on {A} when its price rises',
      },
      { key: 'b', text: 'I switch almost entirely to {B}.', reason: 'a pricier {A} sends you entirely to {B}' },
      {
        key: 'c',
        text: 'I buy less of both, because I need them together.',
        reason: 'both fall when {A} gets pricier',
      },
    ],
  },
];

export function fillNames(text: string, goodA: string, goodB: string): string {
  return text.replaceAll('{A}', goodA).replaceAll('{B}', goodB);
}
