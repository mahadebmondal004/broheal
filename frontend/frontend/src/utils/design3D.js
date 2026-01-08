/**
 * 3D Design System Utility Classes
 * Common class combinations for consistent 3D effects across all admin components
 */

export const design3D = {
    // Cards
    card: "card-3d transition-3d hover:scale-[1.02]",
    cardFlat: "card-3d",
    cardInteractive: "card-3d transition-3d hover:scale-105 cursor-pointer",

    // Buttons
    buttonPrimary: "btn-3d press-effect transition-3d",
    buttonSecondary: "btn-3d-inset press-effect transition-3d",
    buttonDanger: "btn-3d press-effect transition-3d hover:shadow-red-500/30",
    buttonSuccess: "btn-3d press-effect transition-3d hover:shadow-green-500/30",

    // Inputs
    input: "input-3d transition-3d focus:scale-[1.01]",
    inputFocus: "input-3d transition-3d",

    // Containers
    container: "bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 card-3d",
    containerFlat: "bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10",

    // Modal
    modal: "bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/10 float-3d",
    modalOverlay: "fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]",

    // Table
    tableRow: "hover:bg-gray-50/50 dark:hover:bg-white/5 transition-3d",
    tableHeader: "bg-gray-50/50 dark:bg-white/5",

    // Badge
    badge: "badge-3d",
    badgeSuccess: "badge-3d bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    badgeWarning: "badge-3d bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    badgeDanger: "badge-3d bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    badgeInfo: "badge-3d bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",

    // Icon Container
    iconContainer: "btn-3d p-3 rounded-xl",
    iconContainerSmall: "btn-3d p-2 rounded-lg",

    // Stats
    statCard: "card-3d transition-3d hover:scale-105",

    // Sidebar
    sidebar: "sidebar-3d",
    sidebarButton: "btn-3d press-effect transition-3d",
    sidebarButtonActive: "btn-3d press-effect",
    sidebarButtonInactive: "btn-3d-inset press-effect",

    // Glass Effect
    glass: "glass-3d",

    // Floating
    float: "float-3d",

    // Animations
    pulse: "animate-pulse-3d",
    float: "animate-float",

    // Text
    textEmbossLight: "text-emboss-light",
    textEmbossDark: "text-emboss-dark",

    // Glow
    glowBlue: "glow-blue",
    glowPurple: "glow-purple",
};

/**
 * Helper function to combine 3D classes with custom classes
 */
export const cn3D = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

export default design3D;
