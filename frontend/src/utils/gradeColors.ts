// Swiss Grade (1.0 to 6.0) Color System:
// 5.5 - 6.0: Smaragdgrün
// 4.8 - 5.4: Waldgrün
// 4.4 - 4.7: Leichtes Grün / Lime
// 4.0 - 4.3: Warmes Gold / Bernstein
// 3.0 - 3.9: Orange
// 2.0 - 2.9: Rot
// 1.0 - 1.9: Dunkelrot
export function getGradeTheme(score: number | null): {
  bg: string;
  badgeBg: string;
  text: string;
  label: string;
} {
  if (score === null || isNaN(score)) {
    return {
      bg: '#202227',
      badgeBg: '#2c2f37',
      text: '#adb5bd',
      label: 'Ungraded'
    };
  }
  if (score >= 5.5) {
    return {
      bg: '#065f46', // Smaragdgrün (5.5 - 6.0)
      badgeBg: '#047857',
      text: '#ffffff',
      label: 'Sehr gut'
    };
  }
  if (score >= 4.8) {
    return {
      bg: '#166534', // Waldgrün (4.8 - 5.4)
      badgeBg: '#15803d',
      text: '#ffffff',
      label: 'Gut'
    };
  }
  if (score >= 4.4) {
    return {
      bg: '#3f6212', // Leicht grün / Lime (4.4 - 4.7)
      badgeBg: '#65a30d',
      text: '#ffffff',
      label: 'Befriedigend'
    };
  }
  if (score >= 4.0) {
    return {
      bg: '#b45309', // Warmes Gold / Bernstein (4.0 - 4.3)
      badgeBg: '#d97706',
      text: '#ffffff',
      label: 'Genügend'
    };
  }
  if (score >= 3.0) {
    return {
      bg: '#c2410c', // Orange (3.0 - 3.9)
      badgeBg: '#ea580c',
      text: '#ffffff',
      label: 'Schwach'
    };
  }
  if (score >= 2.0) {
    return {
      bg: '#b91c1c', // Rot (2.0 - 2.9)
      badgeBg: '#dc2626',
      text: '#ffffff',
      label: 'Ungenügend'
    };
  }
  return {
    bg: '#7f1d1d', // Dunkelrot (1.0 - 1.9)
    badgeBg: '#991b1b',
    text: '#ffffff',
    label: 'Sehr schlecht'
  };
}

export function getGradeHexColor(score: number | null): string {
  if (score === null || isNaN(score)) return '#1c1e24';
  if (score >= 5.5) return '#059669'; // Smaragdgrün
  if (score >= 4.8) return '#16a34a'; // Waldgrün
  if (score >= 4.4) return '#65a30d'; // Leicht grün
  if (score >= 4.0) return '#d97706'; // Bernstein
  if (score >= 3.0) return '#ea580c'; // Orange
  if (score >= 2.0) return '#dc2626'; // Rot
  return '#991b1b'; // Dunkelrot
}
