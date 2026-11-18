// <option> para cada item vindo do servidor ({ id, nome }).
export default function Opcoes({ itens }) {
  return itens.map((item) => (
    <option key={item.id} value={item.id}>
      {item.nome}
    </option>
  ));
}
