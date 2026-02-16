export function ComingSoon({ title }: { title: string }) {
    return (
        <div>
            <h2 className="mb-4">{title}</h2>
            <p className="text-muted">This section is coming soon.</p>
        </div>
    );
}