import Head from 'next/head';
import { app } from '../appconfig';

export default function HeadGlobal() {
    return (
        <Head>
            <meta charSet="utf-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta
                name="viewport"
                content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
            />

            <meta name="apple-mobile-web-app-title" content={app.name} />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="application-name" content={app.name} />
            <meta
                name="apple-mobile-web-app-status-bar-style"
                content="default"
            />
            <meta name="mobile-web-app-capable" content="yes" />

            <meta property="og:type" content="website" />
            <meta property="og:title" content={app.title} />
            <meta property="og:description" content={app.description} />
            <meta property="og:site_name" content={app.name} />
            <meta property="og:image" content={app.image} />

            <meta name="description" content={app.description} />
            <meta name="keywords" content={app.keywords} />
            <link rel="icon" href={app.favicon} type="image/svg+xml" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />

            <meta name="twitter:image" content={app.image} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={app.twitter} />
            <meta name="twitter:creator" content={app.twitter} />
            <meta property="twitter:image:alt" content="Predix club" />
            <meta name="twitter:title" content={app.title} />
            <meta name="twitter:description" content={app.description} />

            <meta property="og:url" content="https://predix.club/" />
            <meta property="og:type" content="website" />
            <meta property="og:image" content={app.image} />
            <meta property="og:image:alt" content="PrediX" />
            <meta property="og:locale" content="en_US" />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:title" content={app.title} />
            <meta property="og:site_name" content={app.name} />
            <meta property="og:description" content={app.description} />
            <meta name="robots" content="index, follow" />
            <title>{app.title}</title>
            <noscript>
                <strong>
                    We're sorry but Predix doesn't work properly without
                    JavaScript enabled. Please enable it to continue.
                </strong>
            </noscript>
        </Head>
    );
}
