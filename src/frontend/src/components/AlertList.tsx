import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DollarSign, Clock, ShieldAlert, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DetectedTrigger } from '../contexts/AppContext';

interface AlertListProps {
    triggers: DetectedTrigger[];
}

export default function AlertList({ triggers }: AlertListProps) {
    const getTypeIcon = (type: DetectedTrigger['type']) => {
        switch (type) {
            case 'financial':
                return DollarSign;
            case 'urgency':
                return Clock;
            case 'coercion':
                return ShieldAlert;
            case 'suspicious':
                return AlertTriangle;
        }
    };

    const getTypeColor = (type: DetectedTrigger['type']) => {
        switch (type) {
            case 'financial':
                return 'text-chart-2';
            case 'urgency':
                return 'text-chart-5';
            case 'coercion':
                return 'text-destructive';
            case 'suspicious':
                return 'text-chart-1';
        }
    };

    const getSeverityVariant = (severity: DetectedTrigger['severity']) => {
        switch (severity) {
            case 'low':
                return 'secondary';
            case 'medium':
                return 'default';
            case 'high':
                return 'default';
            case 'critical':
                return 'destructive';
        }
    };

    const groupedTriggers = triggers.reduce((acc, trigger) => {
        if (!acc[trigger.type]) {
            acc[trigger.type] = [];
        }
        acc[trigger.type].push(trigger);
        return acc;
    }, {} as Record<string, DetectedTrigger[]>);

    return (
        <Card role="region" aria-label="Detected threats" className="border-primary/30 bg-card/50">
            <CardHeader>
                <CardTitle className="text-foreground font-mono uppercase tracking-wider">
                    Detected Threats ({triggers.length})
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    Suspicious patterns found in the message. Click each item to learn more about why it was flagged.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full">
                    {Object.entries(groupedTriggers).map(([type, typeTriggers], typeIndex) => {
                        const Icon = getTypeIcon(type as DetectedTrigger['type']);
                        const color = getTypeColor(type as DetectedTrigger['type']);

                        return (
                            <div key={type} className={cn(typeIndex > 0 && 'mt-4')}>
                                <div className="mb-2 flex items-center gap-2">
                                    <Icon className={cn('h-4 w-4', color)} aria-hidden="true" />
                                    <h3 className="font-semibold capitalize font-mono">{type} Patterns</h3>
                                    <Badge variant="outline" className="border-primary/30" aria-label={`${typeTriggers.length} ${type} patterns detected`}>
                                        {typeTriggers.length}
                                    </Badge>
                                </div>
                                {typeTriggers.map((trigger, index) => (
                                    <AccordionItem
                                        key={`${type}-${index}`}
                                        value={`${type}-${index}`}
                                        className="border-l-2 border-l-primary/30 pl-4"
                                    >
                                        <AccordionTrigger 
                                            className="hover:no-underline"
                                            aria-label={`${trigger.context}, severity: ${trigger.severity}`}
                                        >
                                            <div className="flex flex-1 items-center justify-between gap-2 pr-4 text-left">
                                                <div className="flex-1">
                                                    <p className="font-medium">{trigger.context}</p>
                                                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                                                        "{trigger.pattern}"
                                                    </p>
                                                </div>
                                                <Badge variant={getSeverityVariant(trigger.severity)} className="uppercase tracking-wider">
                                                    {trigger.severity}
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <Alert className="mt-2 border-primary/30 bg-primary/5">
                                                <AlertTitle className="text-sm font-mono uppercase tracking-wider">Why this matters</AlertTitle>
                                                <AlertDescription className="text-sm">
                                                    {trigger.educationalInfo}
                                                </AlertDescription>
                                            </Alert>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </div>
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
}

