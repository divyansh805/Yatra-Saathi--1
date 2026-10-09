/**
 * Dynamically compute greeting based on user's actual local browser time:
 * 5:00 AM – 11:59 AM: Good Morning
 * 12:00 PM – 4:59 PM: Good Afternoon
 * 5:00 PM – 11:59 PM: Good Evening
 * 12:00 AM – 4:59 AM: Good Evening
 */
export function getTimeBasedGreeting(fullName?: string): { greeting: string; firstName: string; fullGreeting: string } {
  const hour = new Date().getHours();
  let greeting = 'Good Evening';

  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
  } else {
    greeting = 'Good Evening';
  }

  const firstName = fullName?.trim() ? fullName.trim().split(' ')[0] : 'Traveler';
  const fullGreeting = `${greeting}, ${firstName}! 👋`;

  return { greeting, firstName, fullGreeting };
}
