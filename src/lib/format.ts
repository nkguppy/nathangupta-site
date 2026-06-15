const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/** ISO date → "12 May 2026" (en-GB). */
export const formatDate = (iso: string) => dateFmt.format(new Date(iso))
