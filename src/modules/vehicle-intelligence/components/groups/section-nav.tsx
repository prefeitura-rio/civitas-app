/** As abas fixas dos perfis de grupo e de território (`sections`: [chave, nome] na ordem da página). */
export function SectionNav<K extends string>({
  sections,
  active,
  onSelect,
}: {
  sections: ReadonlyArray<readonly [K, string]>
  active: K
  onSelect: (key: K) => void
}) {
  return (
    <nav className="group-sections" aria-label="Seções do perfil">
      {sections.map(([key, name]) => (
        <button
          key={key}
          type="button"
          aria-current={active === key ? 'true' : undefined}
          className={active === key ? 'active' : ''}
          onClick={() => onSelect(key)}
        >
          {name}
        </button>
      ))}
    </nav>
  )
}
