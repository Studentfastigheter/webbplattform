import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction, Button,
} from 'campuslyan';

export const ListingCard = () => (
  <Card style={{ width: 360 }}>
    <CardHeader>
      <CardTitle>Ljus etta nära campus</CardTitle>
      <CardDescription>Lund · 1 rum och kök · 32 m²</CardDescription>
      <CardAction>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#004225' }}>6 500 kr/mån</span>
      </CardAction>
    </CardHeader>
    <CardContent>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--muted-foreground)' }}>
        Modern studentlägenhet med balkong och tvättmaskin, fem minuters
        promenad från universitetet. Inflyttning omgående.
      </p>
    </CardContent>
    <CardFooter style={{ gap: 8 }}>
      <Button variant="default" size="sm">Ansök</Button>
      <Button variant="ghost" size="sm">Spara</Button>
    </CardFooter>
  </Card>
);

export const StatCard = () => (
  <Card style={{ width: 240 }}>
    <CardHeader>
      <CardDescription>Aktiva ansökningar</CardDescription>
      <CardTitle style={{ fontSize: 32 }}>12</CardTitle>
    </CardHeader>
    <CardContent>
      <p style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>+3 sedan förra veckan</p>
    </CardContent>
  </Card>
);

export const Simple = () => (
  <Card style={{ width: 320 }}>
    <CardHeader>
      <CardTitle>Verifiera din e-post</CardTitle>
      <CardDescription>Vi har skickat en länk till din inkorg.</CardDescription>
    </CardHeader>
    <CardFooter>
      <Button variant="outline" size="sm">Skicka igen</Button>
    </CardFooter>
  </Card>
);
