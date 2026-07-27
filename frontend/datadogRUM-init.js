import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';

datadogRum.init({
    applicationId: 'ed18ff50-c8dd-4c25-8f86-3ca53f7b7bc7',
    clientToken: 'pub3adcdb1ec9c1ef5f2a9c8782738f5be4',
    site: 'datadoghq.com',
    service: 'vibe mediaplayer',
    env: 'product',				// e.g. 'prod', 'staging-1', 'dev'
    version: '1.0',	// e.g. '1.0.0'
    sessionSampleRate: 100,			// capture 100% of sessions
    sessionReplaySampleRate: 20,	// capture 20% of sessions with replay
    trackResources: true,			// Enable Resource tracking
    trackUserInteractions: true,	// Enable Action tracking
    trackLongTasks: true,			// Enable Long Tasks tracking
    plugins: [reactPlugin({ router: false })],
});