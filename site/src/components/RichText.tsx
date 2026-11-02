import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { DefaultNodeTypes } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/** Rend le texte de l'éditeur (Lexical) ou, à défaut, le HTML importé de l'ancien site. */
export function Body({ content, legacyHtml, className = 'prose' }: { content?: unknown; legacyHtml?: string | null; className?: string }) {
  const hasContent = Boolean(content && typeof content === 'object' && (content as SerializedEditorState).root?.children?.length)
  if (hasContent) {
    return <LexicalRichText className={className} data={content as SerializedEditorState<DefaultNodeTypes>} />
  }
  if (legacyHtml) {
    return <div className={`${className} prose--legacy`} dangerouslySetInnerHTML={{ __html: legacyHtml }} />
  }
  return null
}
