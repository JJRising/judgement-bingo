export function ComingSoon({ title }: { title: string }) {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            <p className="text-gray-600">This section is coming soon.</p>
        </div>
    );
}