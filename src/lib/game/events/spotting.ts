// Spotting Event Configurations
// Find hallucinations/bugs in code - for AI-generated content review

import type { SpottingEvent } from '../event-types';

export const HALLUCINATION_HUNT_EVENT: SpottingEvent = {
    id: 'hallucination-hunt',
    name: 'Hallucination Hunt',
    description: 'Copilot generated some code. Spot the hallucinated APIs before they make it to production!',
    mechanic: 'spotting',
    notificationDuration: 20,
    difficulty: 'medium',
    cooldownAfterComplete: 120,
    tags: ['ai', 'spotting', 'bugs'],
    rewards: [
        {
            type: 'cash',
            baseAmount: 2000,
            scalingMode: 'performance'
        },
        {
            type: 'delegationMultiplier',
            baseAmount: 0.3,
            scalingMode: 'tiered',
            duration: 60
        }
    ],
    config: {
        content: `import { useState, useEffect } from 'react';
import { fetchData } from './api';

function UserDashboard() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      const result = await fetchData();
      setData(result.data);
    };
    loadData();
  }, []);
  
  if (!data) return <Loading />;
  
  return (
    <div>
      <h1>{data.user.name}</h1>
      <p>Joined: {data.user.created_at}</p>
    </div>
  );
}

export default UserDashboard;`,
        hallucinations: [
            { line: 1, text: "import { useState, useEffect } from 'react'", isHallucination: false },
            { line: 2, text: "import { fetchData } from './api'", isHallucination: true },
            { line: 9, text: "const result = await fetchData()", isHallucination: false },
            { line: 10, text: "setData(result.data)", isHallucination: true },
            { line: 16, text: "{data.user.created_at}", isHallucination: true }
        ],
        timeLimit: 18
    }
};

export const CODE_REVIEW_EVENT: SpottingEvent = {
    id: 'code-review',
    name: 'Emergency Code Review',
    description: 'Junior dev pushed to main. Find the bugs before the deploy finishes!',
    mechanic: 'spotting',
    notificationDuration: 15,
    difficulty: 'easy',
    cooldownAfterComplete: 90,
    tags: ['review', 'bugs', 'speed'],
    rewards: [
        {
            type: 'loc',
            baseAmount: 300,
            scalingMode: 'performance'
        }
    ],
    config: {
        content: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price;
  }
  return total;
}

const result = calculateTotal(cart);
console.log(result);
process.exit();`,
        hallucinations: [
            { line: 3, text: "i <= items.length", isHallucination: true },
            { line: 4, text: "items[i].price", isHallucination: false },
            { line: 9, text: "process.exit()", isHallucination: true }
        ],
        timeLimit: 12
    }
};
