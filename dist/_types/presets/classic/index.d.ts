import { LitElement } from 'lit';
import { Scope } from 'rete';
import { SocketPositionWatcher } from 'rete-render-utils';
import { RenderPreset } from '../types';
import { ClassicScheme, ExtractPayload, LitArea2D } from './types';
export { Connection } from './components/Connection';
export { Control } from './components/Control';
export { Node } from './components/Node';
export { Socket } from './components/Socket';
declare type Component<Props extends Record<string, any>> = typeof LitElement | {
    new (): LitElement & Props;
};
declare type CustomizationProps<Schemes extends ClassicScheme> = {
    node?: (data: ExtractPayload<Schemes, 'node'>) => Component<any> | null;
    connection?: (data: ExtractPayload<Schemes, 'connection'>) => Component<any> | null;
    socket?: (data: ExtractPayload<Schemes, 'socket'>) => Component<any> | null;
    control?: (data: ExtractPayload<Schemes, 'control'>) => Component<any> | null;
};
declare type ClassicProps<Schemes extends ClassicScheme, K> = {
    socketPositionWatcher?: SocketPositionWatcher<Scope<never, [K]>>;
    customize?: CustomizationProps<Schemes>;
};
/**
 * Classic preset for rendering nodes, connections, controls and sockets.
 */
export declare function setup<Schemes extends ClassicScheme, K extends LitArea2D<Schemes>>(props?: ClassicProps<Schemes, K>): RenderPreset<Schemes, K>;
//# sourceMappingURL=index.d.ts.map