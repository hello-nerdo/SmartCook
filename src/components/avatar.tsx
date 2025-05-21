type Props = {
  name: string;
  picture: string;
};

export default function Avatar({ name, picture }: Props) {
  return (
    <div className="flex items-center">
      <img
        src={picture}
        width={48}
        height={48}
        className="w-12 h-12 mr-4 rounded-full"
        alt={name}
      />
      <div className="text-xl font-bold">{name}</div>
    </div>
  );
}
