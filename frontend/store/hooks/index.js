/**
 * Central export file for all Redux hooks
 * Import hooks from this file in your components
 * 
 * @example
 * import { useAuth, useEvent, useClub } from '@/store/hooks';
 * 
 * function MyComponent() {
 *   const { user, login, logout } = useAuth();
 *   const { events, fetchEvents } = useEvent();
 *   const { clubs, createClub } = useClub();
 *   // ...
 * }
 */

export { useAuth } from "./auth.hook";
export { useCollege } from "./college.hook";
export { useClub } from "./club.hook";
export { useEvent } from "./event.hook";
export { useRegistration } from "./registration.hook";
export { useBootstrap } from "./bootstrap.hook";
