import { RootRoute, Route, Router } from '@tanstack/react-router';
import App from './App';
import { DocumentEditor } from './components/DocumentEditor';
import { DocumentList } from './components/DocumentList';

const rootRoute = new RootRoute({
  component: App,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div style={{ marginTop: '20px' }}>
      <h2>Welcome to Collaborative Editor</h2>
      <p>Create or select a document to start editing.</p>
    </div>
  ),
});

const documentsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/documents',
  component: DocumentList,
});

const documentRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/documents/$docId',
  component: DocumentEditor,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  documentsRoute,
  documentRoute,
]);

/**
 * router.
 * @since 1.0.0
 */
export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
