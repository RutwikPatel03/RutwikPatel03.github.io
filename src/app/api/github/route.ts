import { NextResponse } from 'next/server';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const GITHUB_USERNAME = 'RutwikPatel13';





const query = `
  query($username: String!, $from: DateTime, $to: DateTime) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              color
            }
          }
        }
      }
      createdAt
    }
  }
`;

// Calculate available years from account creation date to current year
function getContributionYears(createdAt: string): number[] {
  const startYear = new Date(createdAt).getFullYear();
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }
  return years;
}

export async function GET(request: Request) {
  const token = process.env.GITHUB_TOKEN;
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');

  if (!token) {
    return NextResponse.json(
      { error: 'GitHub token not configured' },
      { status: 500 }
    );
  }

  try {
    // Build date range for the year if specified
    const variables: { username: string; from?: string; to?: string } = {
      username: GITHUB_USERNAME
    };

    if (year) {
      const yearNum = parseInt(year);
      variables.from = `${yearNum}-01-01T00:00:00Z`;
      variables.to = `${yearNum}-12-31T23:59:59Z`;
    }

    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    // Check for GraphQL errors
    if (data.errors) {
      console.error('GitHub GraphQL errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'GraphQL error');
    }

    if (!data.data?.user) {
      throw new Error('User not found');
    }

    const { user } = data.data;
    const { contributionsCollection, createdAt } = user;
    const { contributionCalendar } = contributionsCollection;
    const years = getContributionYears(createdAt);

    return NextResponse.json({
      totalContributions: contributionCalendar.totalContributions,
      weeks: contributionCalendar.weeks,
      years,
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' },
      { status: 500 }
    );
  }
}

