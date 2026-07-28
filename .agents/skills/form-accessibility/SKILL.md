---
name: form-accessibility
description: Acessibilidade e UX de formulários em React Native. Usar ao criar, refatorar ou revisar telas com formulários, inputs, botões e navegação por teclado. Cobre keyboard types, focus chain, accessibilityRole/Label, e boas práticas de input UX.
version: 1.0.0
license: MIT
---

# Form Accessibility & Input UX

Skill para garantir que formulários em React Native tenham boa experiência de teclado, navegação por foco, e acessibilidade básica.

Usar ao implementar, refatorar ou revisar qualquer tela com campos de input.

---

## 1. Keyboard Types

Cada campo deve usar o `keyboardType` e `textContentType` correto para o tipo de dado esperado. Isso garante que o teclado correto apareça no dispositivo e que o autofill funcione.

### Mapa de tipos

| Dado | `keyboardType` | `textContentType` (iOS) | `autoComplete` (Android) |
|------|---------------|------------------------|--------------------------|
| CPF / CNPJ | `number-pad` | `username` | `username` |
| Telefone | `phone-pad` | `telephoneNumber` | `tel` |
| E-mail | `email-address` | `emailAddress` | `email` |
| Senha (nova) | `default` | `newPassword` | `password-new` |
| Senha (login) | `default` | `password` | `password` |
| CEP | `number-pad` | `postalCode` | `postal-code` |
| Número (genérico) | `numeric` | `none` | `off` |
| Dinheiro / valor | `numeric` | `none` | `off` |
| Nome completo | `default` | `name` | `name` |
| Código SMS/OTP | `number-pad` | `oneTimeCode` | `sms-otp` |
| Texto genérico | `default` | `none` | `off` |

### Regras
- **Nunca** usar `keyboardType="default"` para campos numéricos.
- **Sempre** definir `textContentType` no iOS para ativar autofill corretamente.
- Campos de senha: usar `secureTextEntry={true}`.
- Campos de e-mail: usar `autoCapitalize="none"` + `autoCorrect={false}`.
- Campos de nome: usar `autoCapitalize="words"`.

---

## 2. Focus Chain (onSubmitEditing)

Campos de formulário devem encadear o foco para que o botão "Next" / "Próximo" do teclado mova para o próximo campo, e o último campo acione a ação principal.

### Padrão

```tsx
const nameRef = useRef<TextInput>(null);
const emailRef = useRef<TextInput>(null);

<Input
  placeholder="Nome"
  returnKeyType="next"
  onSubmitEditing={() => emailRef.current?.focus()}
  blurOnSubmit={false}
/>

<Input
  ref={emailRef}
  placeholder="E-mail"
  returnKeyType="done"
  onSubmitEditing={handleSubmit(onSubmit)}
/>
```

### Regras
- **Todos os campos** (exceto o último) devem usar `returnKeyType="next"`.
- O **último campo** deve usar `returnKeyType="done"` ou `returnKeyType="send"`.
- O `onSubmitEditing` do último campo deve chamar `handleSubmit(onSubmit)` ou `Keyboard.dismiss()`.
- Usar `blurOnSubmit={false}` em campos intermediários para evitar que o teclado feche e reabra.
- Para campos não-texto (DatePicker, Select): o campo anterior pode chamar `setOpenDatePicker(true)` ou similar no `onSubmitEditing`.

### Com react-hook-form
```tsx
const { setFocus } = useForm();

<Form.Input
  returnKeyType="next"
  onSubmitEditing={() => setFocus('email')}
  blurOnSubmit={false}
/>
```

### Com Form.Input
O `Form.Input` já conecta `ref` ao campo via `useFormField()`. Para encadear foco com `Form.Field`, passar `onSubmitEditing` como prop do `Form.Input`.

---

## 3. Accessibility Roles & Labels

### Roles obrigatórios

| Elemento | `accessibilityRole` |
|----------|-------------------|
| `Button` / `Pressable` (ação) | `"button"` |
| `TextInput` / `Input` | `"none"` (padrão) ou `"search"` se for campo de busca |
| `Switch` | `"switch"` |
| `Checkbox` | `"checkbox"` |
| Link de texto | `"link"` |
| Imagem decorativa | `"none"` + `accessible={false}` |
| Header de seção | `"header"` |

### accessibilityLabel
- Usar quando o texto visível **não é suficiente** para descrever a ação.
- Exemplos:
  - Ícone de olho para toggle senha: `accessibilityLabel="Alternar visibilidade da senha"`
  - Botão com ícone X: `accessibilityLabel="Limpar campo"`
  - Ícone de voltar: `accessibilityLabel="Voltar"`

### accessibilityHint
- Usar para explicar **o que acontece** ao interagir, quando não é óbvio.
- Exemplo: `accessibilityHint="Toque duas vezes para abrir o seletor de data"`

### Regras
- **Nunca** deixar um `Pressable` ou `TouchableOpacity` interativo sem `accessibilityRole="button"`.
- Campos de formulário devem ter `placeholder` descritivo ou `accessibilityLabel` quando sem placeholder.
- Imagens decorativas (ícones de layout, separadores) devem ter `accessible={false}`.
- Textos de erro devem ser anunciados: `Form.Message` já cuida disso via contexto.

---

## 4. Keyboard Behavior

### KeyboardAvoidingView
- **iOS**: usar `behavior="padding"`.
- **Android**: geralmente `behavior={undefined}` (o Android já ajusta com `android:windowSoftInputMode="adjustResize"`).
- Sempre envolver formulários em `KeyboardAvoidingView` + `ScrollView` para garantir que campos baixos fiquem visíveis.

```tsx
<KeyboardAvoidingView
  className="flex-1"
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
>
  <ScrollView keyboardShouldPersistTaps="handled">
    {/* campos */}
  </ScrollView>
</KeyboardAvoidingView>
```

### Regras
- Sempre usar `keyboardShouldPersistTaps="handled"` no ScrollView para permitir tocar em botões sem fechar o teclado.
- Para dismiss manual do teclado, envolver com `TouchableWithoutFeedback onPress={Keyboard.dismiss}` ou usar `Pressable`.
- **Não** usar `keyboardShouldPersistTaps="always"` — impede dismiss do teclado ao tocar fora.

---

## 5. Input States & Feedback

### Disabled
- Campos desabilitados devem ter `disabled={true}` que aplica `opacity-50` visual.
- Nunca "esconder" campos — sempre mostrar desabilitado com contexto.

### Loading
- Botão de submit deve usar `loading={true}` do componente `Button` — mostra spinner e desabilita.
- **Nunca** deixar o botão ativo durante submissão.

### Erros
- Usar `Form.Message` para exibir erros inline abaixo do campo.
- Erro deve aparecer imediatamente após `onBlur` ou validação `onChange` (configurado no `useForm({ mode })` ).
- Cores de erro: `border-feedback-critical-low-border` para borda, `text-feedback-critical-low-content` para texto.

---

## 6. Checklist Rápido

Usar esta checklist ao revisar formulários:

- [ ] Cada campo tem `keyboardType` correto para o tipo de dado
- [ ] Cada campo tem `textContentType` (iOS) / `autoComplete` (Android) correto
- [ ] Campos encadeiam foco via `onSubmitEditing` + `returnKeyType="next"`
- [ ] Último campo tem `returnKeyType="done"` e chama submit ou dismiss
- [ ] `blurOnSubmit={false}` nos campos intermediários
- [ ] `autoCapitalize` correto: `"none"` para email/senha, `"words"` para nomes, `"characters"` para códigos
- [ ] `autoCorrect={false}` em campos de senha, email, CPF, códigos
- [ ] Botões interativos têm `accessibilityRole="button"`
- [ ] Ícones de ação (clear, toggle) têm `accessibilityLabel`
- [ ] Imagens decorativas têm `accessible={false}`
- [ ] `KeyboardAvoidingView` com behavior correto por plataforma
- [ ] `ScrollView` com `keyboardShouldPersistTaps="handled"`
- [ ] Botão de submit usa `disabled` + `loading` durante submissão
- [ ] Erros inline via `Form.Message` (não manual)
