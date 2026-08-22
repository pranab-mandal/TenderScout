declare module '@agentrhq/webcmd/registry' {
  export enum Strategy {
    PUBLIC = 'public',
    COOKIE = 'cookie',
    INTERCEPT = 'intercept',
    UI = 'ui',
    LOCAL = 'local'
  }

  export interface CliArg {
    name: string;
    type?: 'string' | 'int' | 'boolean' | 'number';
    positional?: boolean;
    required?: boolean;
    valueRequired?: boolean;
    default?: any;
    help?: string;
    choices?: string[];
  }

  export interface CliPipelineStep {
    fetch?: { url: string };
    select?: string;
    [key: string]: any;
  }

  export interface CliOptions {
    site: string;
    name: string;
    description: string;
    strategy: Strategy | string;
    browser?: boolean;
    args?: CliArg[];
    columns?: string[];
    pipeline?: CliPipelineStep[];
    func?: (kwargs: Record<string, any>) => Promise<any[]>;
  }

  export function cli(options: CliOptions): void;
}
